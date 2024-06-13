import {
  Component,
  Inject,
  PLATFORM_ID,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import {
  CdkDrag,
  CdkDragDrop,
  CdkDragHandle,
  CdkDragPlaceholder,
  CdkDropList,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { CdkAccordionModule } from '@angular/cdk/accordion';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  FormControl,
} from '@angular/forms';
import { MatSliderModule } from '@angular/material/slider';
import { EditorService } from '../../services/editor.service';
import { FolderData, Item } from '../../interfaces/FolderData';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { Subscription, filter, fromEvent, map } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [
    CdkDropList,
    CdkDrag,
    CdkDragHandle,
    CdkDragPlaceholder,
    CdkAccordionModule,
    MatButtonModule,
    MatIconModule,
    ReactiveFormsModule,
    MatSliderModule,
    ScrollingModule,
  ],
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];

  folders: FolderData[] = [];
  shiftPressed = false;
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private editorService: EditorService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdr: ChangeDetectorRef
  ) {
    this.form = this.fb.group({
      folderCount: [
        50,
        [Validators.required, Validators.min(1), Validators.max(5000)],
      ],
      itemCount: [
        50,
        [Validators.required, Validators.min(1), Validators.max(5000)],
      ],
    });
  }

  get folderCount(): FormControl {
    return this.form.get('folderCount') as FormControl;
  }

  get itemCount(): FormControl {
    return this.form.get('itemCount') as FormControl;
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      const keydown$ = fromEvent<KeyboardEvent>(window, 'keydown').pipe(
        filter((event) => event.key === 'Shift'),
        map(() => true)
      );

      const keyup$ = fromEvent<KeyboardEvent>(window, 'keyup').pipe(
        filter((event) => event.key === 'Shift'),
        map(() => false)
      );

      this.subscriptions.push(
        keydown$.subscribe((pressed) => {
          this.shiftPressed = pressed;
          this.cdr.markForCheck();
        }),
        keyup$.subscribe(() => {
          setTimeout(() => {
            this.shiftPressed = false;
            this.cdr.markForCheck();
          }, 500);
        })
      );

      this.folderCount.valueChanges
        .pipe(map((value) => this.validateAndCorrectInput(this.folderCount)))
        .subscribe(() => this.cdr.markForCheck());

      this.itemCount.valueChanges
        .pipe(map((value) => this.validateAndCorrectInput(this.itemCount)))
        .subscribe(() => this.cdr.markForCheck());
    }

    this.subscriptions.push(
      this.editorService.selectedItem$.subscribe((selectedItem) => {
        this.cdr.markForCheck();
      })
    );

    this.cdr.detectChanges();
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  dropFolder(event: CdkDragDrop<FolderData[]>) {
    if (this.shiftPressed) {
      const copiedFolder = {
        ...event.previousContainer.data[event.previousIndex],
        key: this.generateUniqueId(),
        items: event.previousContainer.data[event.previousIndex].items.map(
          (item) => ({
            ...item,
            id: this.generateUniqueId(),
          })
        ),
      };
      event.container.data.splice(event.currentIndex, 0, copiedFolder);
    } else {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
    this.cdr.markForCheck();
  }

  dropItem(event: CdkDragDrop<Item[]>, folder: FolderData) {
    if (this.shiftPressed) {
      const copiedItem = {
        ...event.previousContainer.data[event.previousIndex],
        id: this.generateUniqueId(),
      };
      folder.items.splice(event.currentIndex, 0, copiedItem);
    } else {
      moveItemInArray(folder.items, event.previousIndex, event.currentIndex);
    }
    this.cdr.markForCheck();
  }

  createFolders() {
    const folderCount = this.folderCount.value;

    if (folderCount === 0) return;

    const newFolders: FolderData[] = Array.from(
      { length: folderCount },
      () => ({
        key: this.generateUniqueId(),
        name: 'Folder ' + this.generateUniqueId(),
        icon: 'home',
        selector: '#f1f2f7',
        cost: 0,
        description: '',
        items: [],
      })
    );

    this.addItemsInBatches(newFolders, this.folders);
    this.cdr.markForCheck();
  }

  createItems(folder: FolderData) {
    const itemCount = this.itemCount.value;

    if (itemCount === 0) return;

    const newItems: Item[] = Array.from({ length: itemCount }, () => ({
      id: this.generateUniqueId(),
      name: 'Item ' + this.generateUniqueId(),
      icon: 'circle',
      selector: 'white',
      description: '',
    }));

    this.addItemsInBatches(newItems, folder.items);
    this.cdr.markForCheck();
  }

  private addItemsInBatches<T>(newItems: T[], targetArray: T[]) {
    const batchSize = 250;
    let index = 0;

    const addBatch = () => {
      if (index < newItems.length) {
        targetArray.push(...newItems.slice(index, index + batchSize));
        index += batchSize;
        requestAnimationFrame(addBatch);
      }
    };

    addBatch();
    this.cdr.markForCheck();
  }

  validateAndCorrectInput(control: FormControl) {
    const value = control.value;
    if (value < 0) {
      control.setValue(0, { emitEvent: false });
    } else if (value > 5000) {
      control.setValue(5000, { emitEvent: false });
    }
    this.cdr.markForCheck();
  }

  generateUniqueId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  }

  selectItem(type: 'folder' | 'item', data: FolderData | Item) {
    this.editorService.selectItem({ type, data });
    this.cdr.markForCheck();
  }

  deleteItem(
    type: 'folder' | 'item',
    item: FolderData | Item,
    parentFolder?: FolderData
  ) {
    if (type === 'folder') {
      this.folders = this.folders.filter(
        (folder) => folder.key !== (item as FolderData).key
      );
      if (this.editorService.getSelectedItem()?.data === item) {
        this.editorService.selectItem(null);
      }
    } else if (type === 'item' && parentFolder) {
      parentFolder.items = parentFolder.items.filter(
        (i) => i.id !== (item as Item).id
      );
      if (this.editorService.getSelectedItem()?.data === item) {
        this.editorService.selectItem(null);
      }
    }
    this.cdr.markForCheck();
  }
}

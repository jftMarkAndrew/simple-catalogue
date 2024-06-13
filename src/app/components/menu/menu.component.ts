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
import { FolderService } from '../../services/folder.service';
import { DragAndDropService } from '../../services/drag-and-drop.service';

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
    private folderService: FolderService,
    private dragAndDropService: DragAndDropService,
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
      this.folderService.folders$.subscribe((folders) => {
        this.folders = folders;
        this.cdr.markForCheck();
      })
    );

    this.subscriptions.push(
      this.editorService.selectedItem$.subscribe(() => {
        this.cdr.markForCheck();
      })
    );

    this.cdr.detectChanges();
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
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

  dropFolder(event: CdkDragDrop<FolderData[]>) {
    this.dragAndDropService.dropFolder(event, this.shiftPressed);
  }

  dropItem(event: CdkDragDrop<Item[]>, folder: FolderData) {
    this.dragAndDropService.dropItem(event, folder, this.shiftPressed);
  }

  createFolders() {
    const folderCount = this.folderCount.value;
    this.folderService.createFolders(folderCount);
  }

  createItems(folder: FolderData) {
    const itemCount = this.itemCount.value;
    this.folderService.createItems(folder, itemCount);
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
      this.folderService.deleteFolder(item as FolderData);
    } else if (type === 'item' && parentFolder) {
      this.folderService.deleteItem(parentFolder, item as Item);
    }
    this.cdr.markForCheck();
  }
}

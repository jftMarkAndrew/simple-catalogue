import {
  Component,
  Inject,
  PLATFORM_ID,
  OnInit,
  OnDestroy,
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
import { FormsModule } from '@angular/forms';
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
    FormsModule,
    MatSliderModule,
    ScrollingModule,
  ],
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];

  folders: FolderData[] = [];
  shiftPressed = false;
  folderCount = 50;
  itemCount = 50;

  constructor(
    private editorService: EditorService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

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
        keydown$.subscribe((pressed) => (this.shiftPressed = pressed)),
        keyup$.subscribe(() => {
          setTimeout(() => {
            this.shiftPressed = false;
          }, 500);
        })
      );
    }
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
  }

  createFolders() {
    if (this.folderCount === 0) return;
    if (this.folderCount < 1) this.folderCount = 1;
    if (this.folderCount > 99999) this.folderCount = 99999;

    const newFolders: FolderData[] = Array.from(
      { length: this.folderCount },
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
  }

  createItems(folder: FolderData) {
    if (this.itemCount === 0) return;
    if (this.itemCount < 1) this.itemCount = 1;
    if (this.itemCount > 99999) this.itemCount = 99999;

    const newItems: Item[] = Array.from({ length: this.itemCount }, () => ({
      id: this.generateUniqueId(),
      name: 'Item ' + this.generateUniqueId(),
      icon: 'circle',
      selector: 'white',
      description: '',
    }));

    this.addItemsInBatches(newItems, folder.items);
  }

  private addItemsInBatches<T>(newItems: T[], targetArray: T[]) {
    const batchSize = 100;
    let index = 0;

    const addBatch = () => {
      if (index < newItems.length) {
        targetArray.push(...newItems.slice(index, index + batchSize));
        index += batchSize;
        requestAnimationFrame(addBatch);
      }
    };

    addBatch();
  }

  validateInput(field: 'folderCount' | 'itemCount') {
    setTimeout(() => {
      if (this[field] < 0) {
        this[field] = 0;
      } else if (this[field] > 99999) {
        this[field] = 99999;
      }
    }, 0);
  }

  generateUniqueId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  }

  selectItem(type: 'folder' | 'item', data: FolderData | Item) {
    this.editorService.selectItem({ type, data });
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
  }
}

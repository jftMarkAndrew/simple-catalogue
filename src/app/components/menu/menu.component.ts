import { Component, HostListener } from '@angular/core';
import {
  CdkDrag,
  CdkDragDrop,
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

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [
    CdkDropList,
    CdkDrag,
    CdkDragPlaceholder,
    CdkAccordionModule,
    MatButtonModule,
    MatIconModule,
    FormsModule,
    MatSliderModule,
  ],
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent {
  folders: FolderData[] = [];
  shiftPressed = false;
  folderCount = 50;
  itemCount = 50;

  constructor(private editorService: EditorService) {}

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Shift') {
      this.shiftPressed = true;
    }
  }

  @HostListener('window:keyup', ['$event'])
  handleKeyUp(event: KeyboardEvent) {
    if (event.key === 'Shift') {
      this.shiftPressed = false;
    }
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
    if (this.folderCount < 1) this.folderCount = 1;
    if (this.folderCount > 50) this.folderCount = 50;

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
    this.folders = [...this.folders, ...newFolders];
  }

  createItems(folder: FolderData) {
    if (this.itemCount < 1) this.itemCount = 1;
    if (this.itemCount > 50) this.itemCount = 50;

    const newItems: Item[] = Array.from({ length: this.itemCount }, () => ({
      id: this.generateUniqueId(),
      name: 'Item ' + this.generateUniqueId(),
      icon: 'circle',
      selector: 'white',
      description: '',
    }));
    folder.items = [...folder.items, ...newItems];
  }

  generateUniqueId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  }

  selectItem(type: 'folder' | 'item', data: any) {
    this.editorService.selectItem({ type, data });
  }

  deleteItem(type: 'folder' | 'item', item: any, parentFolder?: FolderData) {
    if (type === 'folder') {
      this.folders = this.folders.filter((folder) => folder.key !== item.key);
    } else if (type === 'item' && parentFolder) {
      parentFolder.items = parentFolder.items.filter((i) => i.id !== item.id);
    }
  }
}

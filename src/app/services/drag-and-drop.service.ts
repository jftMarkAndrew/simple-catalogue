import { Injectable } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { FolderData, Item } from '../interfaces/FolderData';

@Injectable({
  providedIn: 'root',
})
export class DragAndDropService {
  generateUniqueId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  }

  dropFolder(event: CdkDragDrop<FolderData[]>, shiftPressed: boolean) {
    const folders = event.container.data;
    if (shiftPressed) {
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
      folders.splice(event.currentIndex, 0, copiedFolder);
    } else {
      moveItemInArray(folders, event.previousIndex, event.currentIndex);
    }
  }

  dropItem(
    event: CdkDragDrop<Item[]>,
    folder: FolderData,
    shiftPressed: boolean
  ) {
    if (shiftPressed) {
      const copiedItem = {
        ...event.previousContainer.data[event.previousIndex],
        id: this.generateUniqueId(),
      };
      folder.items.splice(event.currentIndex, 0, copiedItem);
    } else {
      moveItemInArray(folder.items, event.previousIndex, event.currentIndex);
    }
  }
}

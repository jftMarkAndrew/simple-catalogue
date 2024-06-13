import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { FolderData, Item } from '../interfaces/FolderData';

@Injectable({
  providedIn: 'root',
})
export class FolderService {
  private foldersSubject = new BehaviorSubject<FolderData[]>([]);
  folders$ = this.foldersSubject.asObservable();

  createFolders(folderCount: number) {
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

    const folders = [...this.foldersSubject.value, ...newFolders];
    this.foldersSubject.next(folders);
  }

  createItems(folder: FolderData, itemCount: number) {
    const newItems: Item[] = Array.from({ length: itemCount }, () => ({
      id: this.generateUniqueId(),
      name: 'Item ' + this.generateUniqueId(),
      icon: 'circle',
      selector: 'white',
      description: '',
    }));

    folder.items = [...folder.items, ...newItems];
    this.updateFolder(folder);
  }

  deleteFolder(folder: FolderData) {
    const folders = this.foldersSubject.value.filter(
      (f) => f.key !== folder.key
    );
    this.foldersSubject.next(folders);
  }

  deleteItem(folder: FolderData, item: Item) {
    folder.items = folder.items.filter((i) => i.id !== item.id);
    this.updateFolder(folder);
  }

  private updateFolder(updatedFolder: FolderData) {
    const folders = this.foldersSubject.value.map((folder) =>
      folder.key === updatedFolder.key ? updatedFolder : folder
    );
    this.foldersSubject.next(folders);
  }

  private generateUniqueId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  }
}

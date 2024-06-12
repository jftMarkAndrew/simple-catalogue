import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface EditableItem {
  type: 'folder' | 'item';
  data: any;
}

@Injectable({
  providedIn: 'root',
})
export class EditorService {
  private selectedItemSubject = new BehaviorSubject<EditableItem | null>(null);
  selectedItem$ = this.selectedItemSubject.asObservable();

  selectItem(item: EditableItem) {
    this.selectedItemSubject.next(item);
  }

  updateItem(
    newData: Partial<{
      name: string;
      description: string;
      icon: string;
      selector: string;
    }>
  ) {
    const currentItem = this.selectedItemSubject.value;
    if (currentItem) {
      Object.assign(currentItem.data, newData);
      this.selectedItemSubject.next({ ...currentItem });
    }
  }
}

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { EditableItem } from '../interfaces/EditableItem';

@Injectable({
  providedIn: 'root',
})
export class EditorService {
  private selectedItemSubject = new BehaviorSubject<EditableItem | null>(null);
  selectedItem$ = this.selectedItemSubject.asObservable();

  selectItem(item: EditableItem | null) {
    this.selectedItemSubject.next(item);
  }

  getSelectedItem(): EditableItem | null {
    return this.selectedItemSubject.getValue();
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

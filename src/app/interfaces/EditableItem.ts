import { FolderData, Item } from './FolderData';

export interface EditableItem {
  type: 'folder' | 'item';
  data: FolderData | Item;
}

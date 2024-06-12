export interface FolderData {
  key: string;
  name: string;
  icon: string;
  selector: string;
  description: string;
  items: Item[];
}

export interface Item {
  id: string;
  name: string;
  icon: string;
  selector: string;
  description: string;
}

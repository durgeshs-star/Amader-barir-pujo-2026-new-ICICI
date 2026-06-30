export interface AnudanItem {
  name: string;
  cost: string;
}

export interface AnudanCard {
  day: string;
  items: AnudanItem[];
}

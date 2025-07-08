
export interface RelayCategory {
  id: string;
  name: string;
  emoji: string;
  items: RelayItem[];
}

export interface RelayItem {
  id: string;
  name: string;
  relayNumber: number;
  category: string;
}

export interface RelayStatus {
  [key: number]: boolean;
}

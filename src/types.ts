export type Message = {
  role: 'user' | 'model';
  text: string;
};

export type SystemUpdate = {
  hp_change?: number;
  currency_change?: number;
  stats_change?: Record<string, number>;
  inventory_add?: string[];
  inventory_remove?: string[];
  choices?: string[];
};

export type JournalEntry = {
  id: string;
  title: string;
  content: string;
  timestamp: number;
};

export type SaveGame = {
  id: string;
  title: string;
  genre: string;
  charName: string;
  charAppearance: string;
  charSkills: string;
  hp: number;
  currency: number;
  stats: Record<string, number>;
  inventory: string[];
  messages: Message[];
  journal: JournalEntry[];
  lastSystemUpdate: string | null;
  timestamp: number;
};

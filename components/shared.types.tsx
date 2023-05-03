export interface TodoDictionary {
  [timestamp: string]: TodoEntry[];
}

export interface TodoEntry {
  content: string;
  done: boolean;
}

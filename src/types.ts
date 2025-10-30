// src/types.ts
export type Mode = "normal" | "student";
export type Theme = "light" | "dark";

export interface Book {
  key: string;
  title: string;
  author_name?: string[];
  first_publish_year?: number;
  cover_i?: number;
  subject?: string[];
  isbn?: string[];
  publisher?: string[];
  edition_key?: string[];
  has_fulltext?: boolean;
}

export interface SearchFilters {
  year?: string;
  language?: string;
  format?: string;
}

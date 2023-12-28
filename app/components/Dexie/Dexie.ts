import Dexie, { Table } from "dexie";
import { IWritterContent } from "../Writer/interface";

// ALWAYS INCREMENT THIS VERSION NUMBER WHEN CHANGING THE DATABASE SCHEMA
const CURRENT_VERSION = 3;

export interface Pdfs {
  id?: number;
  name: string;
  numOfPages: number;
  // TODO: ADD TYPE
  pages: unknown[];
  createdAt: Date;
  updatedAt: Date;
  currPage?: number;
}

export interface PagesRead {
  id?: number;
  pdfId: number;
  page: number;
  words: number;
  start: Date;
  end?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Scribere {
  id?: number;
  name: string;
  content: IWritterContent[];
  emoji: string;
  img: string | { top: string; bottom: string; deg: number };
  position: number;
  folderId?: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Folders {
  id?: number;
  name: string;
  folderParentId: number;
  createdAt: Date;
  updatedAt: Date;
}

export class DissolutusDexie extends Dexie {
  pdfs!: Table<Pdfs>;
  pages_read!: Table<PagesRead>;
  scribere!: Table<Scribere>;
  folders!: Table<Folders>;

  constructor() {
    super("DISSOLUTUS_READER");

    // DATABASE SCHEMA
    this.version(CURRENT_VERSION).stores({
      pdfs: "++id, name, numOfPages, pages, currPage, createdAt, updatedAt",
      pages_read: "++id, pdfId, words, page, start, end, createdAt, updatedAt",
      scribere:
        "++id, name, content, emoji, img, position, createdAt, folderId, updatedAt",
      folders: "++id, name, folderParentId, createdAt, updatedAt",
    });
  }
}

export const db = new DissolutusDexie();

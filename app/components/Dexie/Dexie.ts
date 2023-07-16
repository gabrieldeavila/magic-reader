import Dexie, { Table } from "dexie";

// ALWAYS INCREMENT THIS VERSION NUMBER WHEN CHANGING THE DATABASE SCHEMA
const CURRENT_VERSION = 1;

export interface Pdfs {
  id?: number;
  name: string;
  numOfPages: number;
  // TODO: ADD TYPE
  pages: any;
  createdAt: Date;
  updatedAt: Date;
  currPage?: number;
}

export class DissolutusDexie extends Dexie {
  pdfs!: Table<Pdfs>;

  constructor() {
    super("DISSOLUTUS_READER");

    // DATABASE SCHEMA
    this.version(CURRENT_VERSION).stores({
      pdfs: "++id, name, numOfPages, pages, currPage, createdAt, updatedAt",
    });
  }
}

export const db = new DissolutusDexie();

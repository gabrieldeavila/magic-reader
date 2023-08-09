export interface IWritterContent {
  type: "p",
  text: string;
}

export interface IWriter {
  content?: IWritterContent[];
}
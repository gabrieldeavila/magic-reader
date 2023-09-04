type TOptions =
  | "bold"
  | "italic"
  | "underline"
  | "strikethrough"
  | "code"
  | "highlight";

export interface IText {
  options?: TOptions[];
  value: string;
  id: number;
}

export interface IWritterContent {
  text: IText[];
  id: number;
}

export interface IWriter {
  content?: IWritterContent[];
}

export interface IEditable extends IWritterContent {
  position: number;
}

export interface IEditableProps extends IEditable {
  ref: React.RefObject<HTMLDivElement>;
}

export type TEditable = { hasFocus: boolean; selection: number | null };

export interface IShortcuts extends IEditable {
  ref: React.RefObject<HTMLDivElement>;
  editableInfo: React.MutableRefObject<TEditable>;
}

export interface IWriterContext {
  content: IWritterContent[];
  setContent: React.Dispatch<React.SetStateAction<IWritterContent[]>>;
  handleUpdate: (textId: number, value: IText[]) => void;
  deleteBlock: (textId: number, blockId: number) => void;
  deleteLine: (textId: number) => void;
  contextName: string;
  info: React.MutableRefObject<IWriterInfo>;
}

export interface InputEvent extends React.KeyboardEvent<HTMLInputElement> {}

export interface ISetRange extends IEditable, IEditableProps {
  editableInfo?: React.MutableRefObject<TEditable>;
}

export interface IWriterInfo {
  selection: number;
  blockId: number;
}

export interface IDecoration extends IText {
  info: React.RefObject<IWriterInfo>;
  onlyOneBlockAndIsEmpty: boolean;
  parentText: IText[];
}

export interface IPopup {
  id: number;
  parentRef: React.RefObject<HTMLDivElement>;
  text: IText[];
}

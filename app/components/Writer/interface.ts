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
  id: string;
}

export interface IWritterContent {
  text: IText[];
  id: string;
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
  handleUpdate: (textId: string, value: IText[]) => void;
  deleteBlock: (textId: string, blockId: string) => void;
  deleteLine: (textId: string) => void;
  contextName: string;
  info: React.MutableRefObject<IWriterInfo>;
}

export interface InputEvent extends React.KeyboardEvent<HTMLInputElement> {}

export interface ISetRange extends IEditable, IEditableProps {
  editableInfo?: React.MutableRefObject<TEditable>;
}

export interface IWriterInfo {
  selection: number;
  blockId: string;
}

export interface IDecoration extends IText {
  info: React.RefObject<IWriterInfo>;
  onlyOneBlockAndIsEmpty: boolean;
  parentText: IText[];
}

export interface IPopup {
  id: string;
  parentRef: React.RefObject<HTMLDivElement>;
  text: IText[];
}

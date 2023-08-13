type TOptions = "bold" | "italic" | "underline" | "strikethrough" | "code";

export interface IText {
  options?: TOptions[];
  value: string;
  id: number;
}

export interface IWritterContent {
  text: IText[];
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
  handleUpdate: (position: number, value: IText) => void;
}

export interface InputEvent extends React.KeyboardEvent<HTMLInputElement> {}

export interface ISetRange extends IEditable, IEditableProps {
  editableInfo?: React.MutableRefObject<TEditable>;
}

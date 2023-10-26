type TOptions =
  | "bold"
  | "italic"
  | "underline"
  | "strikethrough"
  | "code"
  | "highlight";

export type scribereActions = "p" | "h1" | "h2" | "h3" | "ul" | "nl";

export interface IText {
  options?: TOptions[];
  value: string;
  id: string;
}

export interface IWritterContent {
  text: IText[];
  type: scribereActions;
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

type undoActions =
  | "change"
  | "change_multi_lines"
  | "delete_letters"
  | "add_line"
  | "delete_line"
  | "delete_multi_lines"
  | "add_multi_lines";

interface prevLineInfo {
  id: string;
  text: IText[];
  type: scribereActions;
}

export interface ILinesBetween {
  id: string;
  type: "p" | "h1" | "h2";
  text: IText[];
}
[];

export type LineOrText = ILinesBetween | IText;

export interface IWriterContext {
  content: IWritterContent[];
  setContent: React.Dispatch<React.SetStateAction<IWritterContent[]>>;
  handleUpdate: (textId: string, value: IText[]) => void;
  deleteBlock: (textId: string, blockId: string) => void;
  deleteLine: (textId: string) => void;
  addToCtrlZ: ({
    lineId,
    blockId,
    value,
    action,
    position,
    prevLineInfo,
    linesBetween,
  }: {
    lineId: string;
    blockId?: string;
    value?: string | IText[];
    action: undoActions;
    position?: number;
    prevLineInfo?: prevLineInfo;
    linesBetween?: ILinesBetween;
    deletedLines?: ILinesBetween;
  }) => void;
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
  type: scribereActions;
  text: IText[];
}

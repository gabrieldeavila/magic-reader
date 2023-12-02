import WriterContextProvider from "../context/WriterContext";
import { IWriter } from "../interface";

function Editor({ name, content }: IWriter) {
  return (
      <WriterContextProvider name={name} initialContent={content} />
  );
}

export default Editor;

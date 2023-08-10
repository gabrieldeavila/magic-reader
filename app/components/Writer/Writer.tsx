import React from "react";
import { IWriter } from "./interface";
import WriterContextProvider from "./context/WriterContext";

function Writer({ content }: IWriter) {
  return <WriterContextProvider initialContent={content} />;
}

export default Writer;

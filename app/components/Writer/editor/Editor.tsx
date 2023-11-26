import React from "react";
import WriterContextProvider from "../context/WriterContext";
import { IWriter } from "../interface";
import Tabs from "./tabs/Tabs";

function Editor({ content }: IWriter) {
  return (
    <div>
      <Tabs />
      <WriterContextProvider name="writter" initialContent={content} />
    </div>
  );
}

export default Editor;

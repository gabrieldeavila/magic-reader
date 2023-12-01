import React from "react";
import WriterContextProvider from "../context/WriterContext";
import { IWriter } from "../interface";
import Tabs from "./tabs/Tabs";

function Editor({ name, content }: IWriter) {
  return (
    <div>
      <Tabs />
      <WriterContextProvider name={name} initialContent={content} />
    </div>
  );
}

export default Editor;

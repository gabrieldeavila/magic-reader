"use client";

import { Skeletons } from "@geavila/gt-design";
import useIsSSR from "../../hooks/useIsSSR";
import WriterContextProvider from "./context/WriterContext";
import { IWriter } from "./interface";

function Writer({ content }: IWriter) {
  const { isSSR } = useIsSSR();

  if (isSSR) {
    return <Skeletons.Canary />;
  }

  return <WriterContextProvider name="writter" initialContent={content} />;
}

export default Writer;

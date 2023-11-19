"use client";

import { Skeletons } from "@geavila/gt-design";
import useIsSSR from "../../hooks/useIsSSR";
import WriterContextProvider from "./context/WriterContext";
import { IWriter } from "./interface";
import Sidebar from "./sidebar/Sidebar";
import { Scribere } from "./style";
import Navbar from "./navbar/Navbar";

function Writer({ content }: IWriter) {
  const { isSSR } = useIsSSR();

  if (isSSR) {
    return <Skeletons.Canary />;
  }

  return (
    <>
      <Navbar />
      <Scribere.Wrapper>
        <Sidebar />
        <Scribere.Writer>
          <WriterContextProvider name="writter" initialContent={content} />
        </Scribere.Writer>
      </Scribere.Wrapper>
    </>
  );
}

export default Writer;

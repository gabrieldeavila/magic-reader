"use client";

import { Skeletons } from "@geavila/gt-design";
import useIsSSR from "../../hooks/useIsSSR";
import WriterContextProvider from "./context/WriterContext";
import { IWriter } from "./interface";
import Sidebar from "./sidebar/Sidebar";
import { Scribere } from "./style";
import Navbar from "./navbar/Navbar";
import Menu from "./menu/Menu";

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
          <Menu />
          <Scribere.Content>
            <WriterContextProvider name="writter" initialContent={content} />
          </Scribere.Content>
        </Scribere.Writer>
      </Scribere.Wrapper>
    </>
  );
}

export default Writer;

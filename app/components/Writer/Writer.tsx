"use client";

import { Skeletons } from "@geavila/gt-design";
import { useTriggerState } from "react-trigger-state";
import useIsSSR from "../../hooks/useIsSSR";
import Empty from "./Empty/Empty";
import { IWriter } from "./interface";
import Menu from "./menu/Menu";
import Navbar from "./navbar/Navbar";
import Sidebar from "./sidebar/Sidebar";
import { Scribere } from "./style";

function Writer({ content }: IWriter) {
  const { isSSR } = useIsSSR();
  const [menu] = useTriggerState({ name: "menu" });

  if (isSSR) {
    return <Skeletons.Canary />;
  }

  return (
    <>
      <Navbar />
      <Scribere.Wrapper>
        <Sidebar />
        <Scribere.Writer>
          {menu && <Menu />}
          <Scribere.Content>
            <Empty />
            {/* <WriterContextProvider name="writter" initialContent={content} /> */}
          </Scribere.Content>
        </Scribere.Writer>
      </Scribere.Wrapper>
    </>
  );
}

export default Writer;

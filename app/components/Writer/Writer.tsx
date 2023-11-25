"use client";

import { Skeletons } from "@geavila/gt-design";
import { globalState, useTriggerState } from "react-trigger-state";
import useIsSSR from "../../hooks/useIsSSR";
import Empty from "./Empty/Empty";
import { IWriter } from "./interface";
import Menu from "./menu/Menu";
import Navbar from "./navbar/Navbar";
import Sidebar from "./sidebar/Sidebar";
import { Scribere } from "./style";
import { useCallback } from "react";

function Writer({ content }: IWriter) {
  const { isSSR } = useIsSSR();
  const [menu] = useTriggerState({ name: "menu" });

  const onRef = useCallback((e: HTMLDivElement | null) => {
    if (!e) return;

    globalState.set("writter_ref", e);
  }, []);

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
          <Scribere.Content ref={onRef}>
            <Empty />
            {/* <WriterContextProvider name="writter" initialContent={content} /> */}
          </Scribere.Content>
        </Scribere.Writer>
      </Scribere.Wrapper>
    </>
  );
}

export default Writer;

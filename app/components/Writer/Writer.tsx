"use client";

import { Skeletons } from "@geavila/gt-design";
import { useCallback, useEffect } from "react";
import { globalState, useTriggerState } from "react-trigger-state";
import useIsSSR from "../../hooks/useIsSSR";
import Editor from "./editor/Editor";
import { IWriter } from "./interface";
import Menu from "./menu/Menu";
import Navbar from "./navbar/Navbar";
import Sidebar from "./sidebar/Sidebar";
import { Scribere } from "./style";
import Empty from "./empty/Empty";

function Writer({ content }: IWriter) {
  const { isSSR } = useIsSSR();
  const [menu] = useTriggerState({ name: "menu" });

  const [isEmpty, setIsEmpty] = useTriggerState({
    name: "is_empty",
    initial: true,
  });

  const onRef = useCallback((e: HTMLDivElement | null) => {
    if (!e) return;

    globalState.set("writter_ref", e);
  }, []);

  // when ctrl + n is pressed, it will trigger this function
  useEffect(() => {
    const handleNewFile = (e: KeyboardEvent) => {
      e.preventDefault();
      if (e.altKey && e.key === "n") {
        setIsEmpty((prev: boolean) => !prev);
      }
    };

    document.addEventListener("keydown", handleNewFile);

    return () => {
      document.removeEventListener("keydown", handleNewFile);
    };
  }, [setIsEmpty]);

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
            {isEmpty ? <Empty /> : <Editor content={content} />}
          </Scribere.Content>
        </Scribere.Writer>
      </Scribere.Wrapper>
    </>
  );
}

export default Writer;

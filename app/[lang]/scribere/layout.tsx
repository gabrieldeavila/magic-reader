"use client";

import { Skeletons } from "@geavila/gt-design";
import React, { useCallback } from "react";
import { globalState, useTriggerState } from "react-trigger-state";
import Tabs from "../../components/Writer/editor/tabs/Tabs";
import Menu from "../../components/Writer/menu/Menu";
import Navbar from "../../components/Writer/navbar/Navbar";
import Sidebar from "../../components/Writer/sidebar/Sidebar";
import { Scribere } from "../../components/Writer/style";
import useIsSSR from "../../hooks/useIsSSR";
import useShortcuts from "../../components/Writer/hooks/crud/useShortcuts";

function Layout({ children }: { children: React.ReactNode }) {
  const { isSSR } = useIsSSR();
  const [menu] = useTriggerState({ name: "menu" });

  const onRef = useCallback((e: HTMLDivElement | null) => {
    if (!e) return;

    globalState.set("writter_ref", e);
  }, []);

  useShortcuts();

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
            <div>
              <Tabs />
            </div>
            {children}
          </Scribere.Content>
        </Scribere.Writer>
      </Scribere.Wrapper>
    </>
  );
}

export default Layout;

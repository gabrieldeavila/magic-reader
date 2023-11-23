"use client";

import { GTBasic } from "@geavila/gt-design";
import { globalState, useTriggerState } from "react-trigger-state";
import { ReaderModal } from "../components/Reader/Reader";

function GTWrapper({
  serverTranslation,
  lang,
  children,
  kanit,
}: {
  serverTranslation: unknown;
  lang: string;
  children: React.ReactNode;
  kanit: unknown;
}) {
  // @ts-expect-error - uh
  globalState.set("font", kanit.className);
  const [noThemeChange] = useTriggerState({
    initial: false,
    name: "no_theme_change",
  });

  return (
    // <SessionProvider>
    <GTBasic
      serverTranslation={serverTranslation}
      lang={lang}
      themeConfig={{
        global: {
          theme: {
            highlight: "#B3E5FC",
            highlightText: "#333333",
            logoWing: "#ccb183"
          },
          darkTheme: {
            highlight: "#0A192F",
            highlightText: "#D3D3D3",
            logoWing: "#fdf7eb"
          },
        },
      }}
      noThemeChange={noThemeChange}
    >
      <ReaderModal />

      {children}
    </GTBasic>
    // </SessionProvider>
  );
}

export default GTWrapper;

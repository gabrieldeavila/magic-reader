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
            highlight: "#f0e68c",
            highlightText: "#a52a2a",
          },
          darkTheme: {
            highlight: "#ffc40c",
            highlightText: "#c40233",
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

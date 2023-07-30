"use client";

import { GTBasic } from "@geavila/gt-design";
import { globalState, useTriggerState } from "react-trigger-state";

function GTWrapper({
  serverTranslation,
  lang,
  children,
  kanit,
}: {
  serverTranslation: any;
  lang: any;
  children: React.ReactNode;
  kanit: any;
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
      noThemeChange={noThemeChange}
    >
      {children}
    </GTBasic>
    // </SessionProvider>
  );
}

export default GTWrapper;

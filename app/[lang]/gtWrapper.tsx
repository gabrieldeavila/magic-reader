"use client";

/* 
  you probably won't need to change this file
*/

import { GTBasic } from "@geavila/gt-design";
import { globalState } from "react-trigger-state";

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

  return (
    // <SessionProvider>
    <GTBasic serverTranslation={serverTranslation} lang={lang}>
      {children}
    </GTBasic>
    // </SessionProvider>
  );
}

export default GTWrapper;

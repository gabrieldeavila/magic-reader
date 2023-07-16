"use client";

import { GTBasic, Loading } from "@geavila/gt-design";
import { useRouter } from "next/navigation";
import "./global.css";

function notFound() {
  const router = useRouter();

  // gets the current language from the user's browser
  if (typeof window !== "undefined") {
    const lang = navigator.language;
    router.push(`/${lang}`);
  }

  return (
    <GTBasic>
      <Loading show />
    </GTBasic>
  );
}

export default notFound;

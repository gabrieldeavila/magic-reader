"use client";

import { useEffect } from "react";
import { stateStorage } from "react-trigger-state";
import LandingPage from "./[lang]/components/landingPage";

export default function Page() {
  useEffect(() => {
    stateStorage.set("lang", "en");
  }, []);

  return <LandingPage params={{ lang: "en" }} />;
}

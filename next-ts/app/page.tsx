"use client";

import { useEffect } from "react";
import { stateStorage } from "react-trigger-state";
import LandingPage from "./[lang]/components/landingPage";

export default function Page({
  params,
}: {
  params: { lang: "pt-BR" | "en" | null };
}) {
  useEffect(() => {
    stateStorage.set("lang", params.lang);
  }, [params]);

  return <LandingPage params={params} />;
}

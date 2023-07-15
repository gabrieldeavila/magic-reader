"use client";

import { useRouter } from "next/navigation";
import LandingPage from "./components/landingPage";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { stateStorage } from "react-trigger-state";

export default function Page({
  params,
}: {
  params: { lang: "pt-BR" | "en" | null };
}) {
  // // TODO: SHOULD BE DOING BY THE SERVER, WHEN I GOTTA TIME I'LL FIX IT!!!
  // const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    stateStorage.set("lang", params.lang);
  }, [params]);

  // if (session) return router.push(`/${params.lang}/a`);

  return <LandingPage params={params} />;
}

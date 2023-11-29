"use client";

import { useEffect } from "react";
import Empty from "./emptyw/Empty";
import CREATE_SCRIBERE from "./_commands/CREATE";
import { useRouter } from "next/navigation";

function Writer() {
  const router = useRouter();

  // when alt + n is pressed, it will trigger this function
  useEffect(() => {
    const handleNewFile = async (e: KeyboardEvent) => {
      if (e.altKey && e.key === "n") {
        e.preventDefault();

        const newId = await CREATE_SCRIBERE();
        router.push(`scribere/${newId}`);
        console.log(newId);
      }
    };

    document.addEventListener("keydown", handleNewFile);

    return () => {
      document.removeEventListener("keydown", handleNewFile);
    };
  }, [router]);

  return <Empty />;
}

export default Writer;

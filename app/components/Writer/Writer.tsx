"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import CREATE_SCRIBERE from "./_commands/CREATE";
import Empty from "./emptyw/Empty";

function Writer() {
  const router = useRouter();

  // when alt + n is pressed, it will trigger this function
  useEffect(() => {
    const handleNewFile = async (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLocaleLowerCase()=== "n") {
        e.preventDefault();

        const newId = await CREATE_SCRIBERE();
        router.push(`scribere/${newId}`);
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

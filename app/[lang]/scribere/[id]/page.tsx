"use client";

import { useEffect, useState } from "react";
import { db } from "../../../components/Dexie/Dexie";
import Editor from "../../../components/Writer/editor/Editor";
import useFocusOnStart from "../../../components/Writer/hooks/focus/useFocusOnStart";

function Page({ params: { id } }: { params: { id: string } }) {
  const [content, setContent] = useState([]);
  const { addFocus } = useFocusOnStart();

  useEffect(() => {
    (() => {
      db.scribere.get({ id: parseInt(id) }).then((data) => {
        if (!data) return;

        addFocus({ content: data.content });

        setContent(data.content);
      });
    })();
  }, [addFocus, id]);

  return <Editor content={content} />;
}

export default Page;

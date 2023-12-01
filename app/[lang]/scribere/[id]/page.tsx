"use client";

import { useEffect, useState } from "react";
import { useTriggerState } from "react-trigger-state";
import { db } from "../../../components/Dexie/Dexie";
import Editor from "../../../components/Writer/editor/Editor";
import useUpdateContent from "../../../components/Writer/hooks/crud/useUpdateContent";
import useFocusOnStart from "../../../components/Writer/hooks/focus/useFocusOnStart";

function Page({ params: { id } }: { params: { id: string } }) {
  const [content, setContent] = useState([]);
  const { addFocus } = useFocusOnStart();
  const { updateContent } = useUpdateContent({ id });

  const [newContent] = useTriggerState({
    name: `${id}_writter_context`,
  });

  useEffect(() => {
    if (!newContent) return;

    updateContent(newContent);
  }, [newContent, updateContent]);

  useEffect(() => {
    (() => {
      db.scribere.get({ id: parseInt(id) }).then((data) => {
        if (!data) return;

        addFocus({ content: data.content });

        setContent(data.content);
      });
    })();
  }, [addFocus, id]);

  return <Editor name={id} content={content} />;
}

export default Page;

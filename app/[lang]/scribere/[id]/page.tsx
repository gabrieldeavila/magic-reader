"use client";

import { useEffect, useMemo, useState } from "react";
import { stateStorage, useTriggerState } from "react-trigger-state";
import { db } from "../../../components/Dexie/Dexie";
import Editor from "../../../components/Writer/editor/Editor";
import useUpdateContent from "../../../components/Writer/hooks/crud/useUpdateContent";
import useFocusOnStart from "../../../components/Writer/hooks/focus/useFocusOnStart";
import { initialContent } from "../../../components/Writer/_commands/CREATE";

function Page({ params: { id } }: { params: { id: string } }) {
  const [content, setContent] = useState([]);
  const { addFocus } = useFocusOnStart();
  const { updateContent } = useUpdateContent({ id });
  const contextName = useMemo(() => `${id}_writter_context`, [id]);

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

        stateStorage.set(`${contextName}_title`, data.name);
        stateStorage.set(`${contextName}_emoji`, data.emoji);
        stateStorage.set(`${contextName}_img`, data.img);
        stateStorage.set(`${contextName}_image_range`, data.position);
        setContent(data.content.length === 0 ? initialContent : data.content);

        const currTabs = stateStorage.get("tabs");
        const newTabs = [...currTabs, { id: data.id, name: data.name }];
        // filters tabs
        const tabs = newTabs.filter(
          (tab, index, self) => index === self.findIndex((t) => t.id === tab.id)
        );

        // add new tab
        stateStorage.set("tabs", tabs);

        // set active tab
        stateStorage.set("active_tab", data.id);
      });
    })();
  }, [addFocus, contextName, id]);

  return <Editor name={id} content={content} />;
}

export default Page;

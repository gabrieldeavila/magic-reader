import { useCallback, useEffect, useMemo } from "react";
import { db } from "../../../Dexie/Dexie";
import { IWritterContent } from "../../interface";
import {
  globalState,
  stateStorage,
  useTriggerState,
} from "react-trigger-state";

function useUpdateContent({ id }: { id: string }) {
  const contextName = useMemo(() => `${id}_writter_context`, [id]);

  const [title] = useTriggerState({ name: `${contextName}_title` });
  const [emoji] = useTriggerState({ name: `${contextName}_emoji` });
  const [img] = useTriggerState({ name: `${contextName}_img` });
  const [imgPosition] = useTriggerState({
    name: `${contextName}_image_range`,
  });

  const updateContent = useCallback(
    (content: IWritterContent[]) => {
      db.scribere.update(parseInt(id), { content });
    },
    [id]
  );

  useEffect(() => {
    if (title == null || title === "") return;

    db.scribere.update(parseInt(id), { name: title });

    // finds the tab and updates the title
    const allTabs = globalState.get("tabs");
    const updatedTabs = allTabs.map((tab) => {
      if (tab.id == id) {
        return { ...tab, name: title };
      }
      return tab;
    });

    stateStorage.set(`scribere_custom_name_${id}`, title);
    stateStorage.set("tabs", updatedTabs);
  }, [id, title]);

  useEffect(() => {
    if (emoji == null || emoji === "") return;

    db.scribere.update(parseInt(id), { emoji });
    stateStorage.set(`scribere_custom_emoji_${id}`, emoji);
  }, [id, emoji]);

  useEffect(() => {
    if (img == null || img === "") return;

    db.scribere.update(parseInt(id), { img });
  }, [id, img]);

  useEffect(() => {
    if (imgPosition == null || imgPosition === 0) return;

    db.scribere.update(parseInt(id), { position: imgPosition });
  }, [id, imgPosition]);

  return {
    updateContent,
  };
}

export default useUpdateContent;

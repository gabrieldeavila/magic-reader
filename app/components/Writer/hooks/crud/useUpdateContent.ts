import { useCallback, useEffect, useMemo } from "react";
import { db } from "../../../Dexie/Dexie";
import { IWritterContent } from "../../interface";
import { useTriggerState } from "react-trigger-state";

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
    if (title == null) return;

    db.scribere.update(parseInt(id), { name: title });
  }, [id, title]);

  useEffect(() => {
    if (emoji == null) return;

    db.scribere.update(parseInt(id), { emoji });
  }, [id, emoji]);

  useEffect(() => {
    if (img == null) return;

    db.scribere.update(parseInt(id), { img });
  }, [id, img]);

  useEffect(() => {
    if (imgPosition == null) return;

    db.scribere.update(parseInt(id), { position: imgPosition });
  }, [id, imgPosition]);

  return {
    updateContent,
  };
}

export default useUpdateContent;

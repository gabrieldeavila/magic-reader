import { useCallback } from "react";
import { stateStorage } from "react-trigger-state";
import { useWriterContext } from "../context/WriterContext";

function useLinesBetween() {
  const { contextName } = useWriterContext();

  const getLinesBetween = useCallback(
    ({
      firstLineId,
      lastLineId,
    }: {
      firstLineId: string;
      lastLineId: string;
    }) => {
      const lines = stateStorage.get(contextName);

      const firstLineIndex = lines.findIndex((line) => line.id === firstLineId);
      const lastLineIndex = lines.findIndex((line) => line.id === lastLineId);

      // removes the lines without text
      const linesBetween = lines
        .slice(firstLineIndex, lastLineIndex + 1)
        .filter((line) => {
          return !(line.text.length === 1 && line.text[0]?.value.length === 0);
        });

      const newMimic = [];
      const selectedBlocks = [];

      linesBetween.forEach((line) => {
        const { text, id: lineId } = line;

        text.forEach((block) => {
          const { value, id } = block;
          const letters = value.split("");

          selectedBlocks.push(block);

          letters.forEach((letter, index) => {
            newMimic.push({
              id,
              letter,
              index,
              lineId,
            });
          });
        });
      });

      return { newMimic, selectedBlocks, linesBetween };
    },
    [contextName]
  );

  return { getLinesBetween };
}

export default useLinesBetween;

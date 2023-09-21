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

      const tempLinesBetween = lines.slice(firstLineIndex, lastLineIndex + 1);

      // remove the empty lines
      const linesBetween = tempLinesBetween.filter((line) => {
        return !(line.text.length === 1 && line.text[0]?.value.length === 0);
      });

      // if the first tempLine is empty, we create a new id, with the same id as the first line of the linesBetween
      let newFirstLineId;

      if (tempLinesBetween[0].text.length === 0) {
        newFirstLineId = linesBetween[0].id;
      }

      // the same for the last line
      let newLastLineId;

      if (tempLinesBetween[tempLinesBetween.length - 1].text.length === 0) {
        newLastLineId = linesBetween[linesBetween.length - 1].id;
      }

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

      return {
        newLastLineId,
        newFirstLineId,
        newMimic,
        selectedBlocks,
        linesBetween,
      };
    },
    [contextName]
  );

  return { getLinesBetween };
}

export default useLinesBetween;

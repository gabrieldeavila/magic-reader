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
      let slicedTheFirstLine = false;
      let slicedTheLastLine = false;

      // remove the empty lines
      const linesBetween = tempLinesBetween.filter((line, index) => {
        const isEmpty =
          line.text.length === 1 && line.text[0]?.value.length === 0;

        if (isEmpty && index === 0) {
          slicedTheFirstLine = true;
        }

        if (isEmpty && index === tempLinesBetween.length - 1) {
          slicedTheLastLine = true;
        }

        return !isEmpty;
      });

      // if the first tempLine is empty, we create a new id, with the same id as the first line of the linesBetween
      let newFirstLineId;

      if (
        (tempLinesBetween[0]?.text?.length === 0 ||
          tempLinesBetween[0]?.text[0]?.value?.length === 0) &&
        linesBetween[0]?.text?.[0]?.id
      ) {
        newFirstLineId = linesBetween[0].text[0].id;
      }

      // the same for the last line
      let newLastLineId;

      if (
        (tempLinesBetween[tempLinesBetween.length - 1].text.length === 0 ||
          tempLinesBetween[tempLinesBetween.length - 1].text[
            tempLinesBetween[tempLinesBetween.length - 1].text.length - 1
          ]?.value.length === 0) &&
        linesBetween[linesBetween.length - 1]?.text?.[
          linesBetween[linesBetween.length - 1]?.text?.length - 1
        ]?.id
      ) {
        newLastLineId =
          linesBetween[linesBetween.length - 1].text[
            linesBetween[linesBetween.length - 1].text.length - 1
          ].id;
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
        slicedTheFirstLine,
        slicedTheLastLine,
      };
    },
    [contextName]
  );

  return { getLinesBetween };
}

export default useLinesBetween;

import { useCallback } from "react";
import { useWriterContext } from "../context/WriterContext";
import { stateStorage } from "react-trigger-state";

function useDeleteMultiLines() {
  const { deleteLine, contextName } = useWriterContext();

  const deleteMultiLine = useCallback(
    ({ selectedLetters, firstNodeIndex, lastNodeIndex, multiLineInfo }) => {
      // filter out the selected blocks
      const reducedLines = selectedLetters.reduce((acc, block, key) => {
        const { lineId, id, letter } = block;

        const isBetweenFirstAndLastNode =
          key >= firstNodeIndex && key <= lastNodeIndex;

        if (isBetweenFirstAndLastNode) {
          return acc;
        }

        acc[lineId] = acc[lineId] || {};
        acc[lineId][id] = [...(acc[lineId][id] || []), letter];

        return acc;
      }, {});

      const newLines = Object.keys(reducedLines).map((lineId) => {
        const line = reducedLines[lineId];

        const text = Object.keys(line).map((id) => {
          const value = line[id].join("");
          const blockInfo = multiLineInfo.selectedBlocks.find(
            (block) => block.id === id
          );

          return {
            id,
            value,
            options: blockInfo.options,
          };
        });

        return {
          id: lineId,
          text,
        };
      });

      const linesKeys = Object.keys(reducedLines);

      multiLineInfo.linesBetween.forEach(({ id }) => {
        if (!linesKeys.includes(id)) {
          deleteLine(id);
        }
      });

      const currContent = stateStorage.get(contextName).map((item) => {
        if (linesKeys.includes(item.id)) {
          return newLines.find(({ id }) => id === item.id);
        }

        return item;
      });

      console.log(currContent);
      stateStorage.set(contextName, currContent);
    },
    [contextName, deleteLine]
  );

  return { deleteMultiLine };
}

export default useDeleteMultiLines;

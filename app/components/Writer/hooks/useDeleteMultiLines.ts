import { useCallback } from "react";
import { stateStorage } from "react-trigger-state";
import { useWriterContext } from "../context/WriterContext";

function useDeleteMultiLines() {
  const { deleteLine, contextName, info, addToCtrlZ } = useWriterContext();

  const deleteMultiLine = useCallback(
    ({
      first,
      selectedLetters,
      firstNodeIndex,
      lastNodeIndex,
      multiLineInfo,
    }) => {
      // filter out the selected blocks
      const reducedBlocks = selectedLetters.reduce((acc, block, key) => {
        const { id, letter } = block;

        const isBetweenFirstAndLastNode =
          key >= firstNodeIndex && key <= lastNodeIndex;

        if (isBetweenFirstAndLastNode) {
          return acc;
        }

        acc = acc || {};
        acc[id] = [...(acc[id] || []), letter];

        return acc;
      }, {});

      let blocks = Object.keys(reducedBlocks).map((id) => {
        const value = reducedBlocks[id].join("");
        const blockInfo = multiLineInfo.selectedBlocks.find(
          (block) => block.id === id
        );

        return {
          id,
          value,
          options: blockInfo.options,
        };
      });

      if (!blocks.length) {
        blocks = [
          {
            id: first.id,
            value: "",
            options: [],
          },
        ];
      }

      const linesToDelete = multiLineInfo.linesBetween.slice(1);
      const lineParent = multiLineInfo.linesBetween[0];

      linesToDelete.forEach(({ id }) => {
        deleteLine(id);
      });

      const currContent = stateStorage.get(contextName).map((item) => {
        if (lineParent?.id === item.id) {
          return {
            ...lineParent,
            text: blocks,
          };
        }

        return item;
      });

      info.current = {
        selection: first.index,
        blockId: first.id,
      };

      addToCtrlZ({
        lineId: lineParent.id,
        linesBetween: multiLineInfo.linesBetween,
        value: blocks,
        action: "delete_multi_lines",
      });

      stateStorage.set(`${contextName}_decoration-${first.id}`, new Date());

      stateStorage.set(contextName, currContent);

      return lineParent.id;
    },
    [addToCtrlZ, contextName, deleteLine, info]
  );

  return { deleteMultiLine };
}

export default useDeleteMultiLines;

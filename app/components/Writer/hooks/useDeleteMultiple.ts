import { useCallback } from "react";
import usePositions from "./usePositions";
import { stateStorage } from "react-trigger-state";
import { useWriterContext } from "../context/WriterContext";

function useDeleteMultiple({ text, id, info }) {
  const { getSelectedBlocks } = usePositions({ text });
  const { contextName, handleUpdate } = useWriterContext();

  const deleteMultipleLetters = useCallback(() => {
    const { selectedBlocks, first, last } = getSelectedBlocks();

    const newWords = [];

    text.forEach((item) => {
      const { id: blockId, value: blockValue } = item;

      const isBlockSelected = selectedBlocks.some(({ id }) => id === blockId);
      const isStartOrEndBlock = first.id === blockId || last.id === blockId;

      if (isBlockSelected && !isStartOrEndBlock) {
        return;
      }

      if (isBlockSelected && isStartOrEndBlock && first.id === last.id) {
        const letters = blockValue.split("");

        let newValue = "";

        letters.forEach((item, index) => {
          if (index < first.index || index >= last.index + 1) {
            newValue += item;
          }

          return;
        });

        if (!newValue) {
          return;
        }

        newWords.push({
          ...item,
          value: newValue,
        });

        return;
      }

      if (isBlockSelected && isStartOrEndBlock) {
        if (first.id === blockId) {
          const letters = blockValue.split("");

          let newValue = "";

          letters.forEach((item, index) => {
            if (index < first.index) {
              newValue += item;
            }

            return;
          });

          if (!newValue) {
            return;
          }

          newWords.push({
            ...item,
            value: newValue,
          });

          return;
        }

        if (last.id === blockId) {
          const letters = blockValue.split("");

          let newValue = "";

          letters.forEach((item, index) => {
            if (index >= last.index + 1) {
              newValue += item;
            }

            return;
          });

          if (!newValue) {
            return;
          }

          newWords.push({
            ...item,
            value: newValue,
          });

          return;
        }

        return;
      }

      newWords.push(item);
    });

    // if there is no new words, add an empty block
    if (!newWords.length) {
      newWords.push({
        id: Math.random(),
        value: "",
        options: [],
      });
    }

    handleUpdate(id, newWords);

    // changes also the cursor position
    info.current = {
      selection: first.index,
      blockId: first.id,
    };

    stateStorage.set(`${contextName}_decoration-${first.id}`, new Date());
  }, [contextName, getSelectedBlocks, handleUpdate, id, info, text]);

  return { deleteMultipleLetters };
}

export default useDeleteMultiple;

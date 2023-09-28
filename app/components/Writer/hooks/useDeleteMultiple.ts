import { useCallback } from "react";
import usePositions from "./usePositions";
import { stateStorage } from "react-trigger-state";
import { useWriterContext } from "../context/WriterContext";
import uuid from "../../../utils/uuid";

function useDeleteMultiple({ text, id, info }) {
  const { getSelectedBlocks } = usePositions({ text });
  const { contextName, handleUpdate, addToCtrlZ } = useWriterContext();

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
        id: uuid(),
        value: "",
        options: [],
      });
    }

    addToCtrlZ({ lineId: id, value: newWords, action: "delete_line" });
    handleUpdate(id, newWords);

    // changes also the cursor position
    info.current = {
      selection: first.index,
      blockId: first.id,
    };

    stateStorage.set(`${contextName}_decoration-${first.id}`, new Date());
  }, [
    addToCtrlZ,
    contextName,
    getSelectedBlocks,
    handleUpdate,
    id,
    info,
    text,
  ]);

  return { deleteMultipleLetters };
}

export default useDeleteMultiple;

import { useCallback } from "react";
import usePositions from "./usePositions";
import { stateStorage } from "react-trigger-state";
import { useWriterContext } from "../context/WriterContext";
import uuid from "../../../utils/uuid";
import useDeleteMultiLines from "./useDeleteMultiLines";

function useDeleteMultiple({ text, id, info }) {
  const { getSelectedBlocks } = usePositions({ text });
  const { contextName, handleUpdate, addToCtrlZ } = useWriterContext();

  const { deleteMultiLine } = useDeleteMultiLines();

  const deleteMultipleLetters = useCallback(() => {
    const { selectedBlocks, first, last, areFromDiffLines, ...rest } =
      getSelectedBlocks();

    if (areFromDiffLines) {
      // @ts-expect-error - rest has the same type as the return of deleteMultiLine
      return deleteMultiLine({ first, ...rest });
    }
    addToCtrlZ({
      lineId: id,
      value: structuredClone(text),
      action: "delete_letters",
      blockId: first.id,
    });

    const firstIndex = text.findIndex(({ id }) => id === first.id);

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

    const noNewWords = !newWords.length;
    const newId = uuid();

    // if there is no new words, add an empty block
    if (noNewWords) {
      newWords.push({
        id: newId,
        value: "",
        options: [],
      });
    }

    handleUpdate(id, newWords);

    // sees if the first was deleted
    const firstWasDeleted = !newWords.some(({ id }) => id === first.id);

    // if the first was deleted, gets the next block, by the next index
    const nextBlock = firstWasDeleted
      ? { ...newWords[firstIndex], index: 0 }
      : first;

    // changes also the cursor position
    info.current = {
      selection: noNewWords ? 0 : nextBlock.index,
      blockId: noNewWords ? newId : nextBlock.id,
    };

    stateStorage.set(`${contextName}_decoration-${nextBlock.id}`, new Date());
  }, [
    addToCtrlZ,
    contextName,
    deleteMultiLine,
    getSelectedBlocks,
    handleUpdate,
    id,
    info,
    text,
  ]);

  return { deleteMultipleLetters };
}

export default useDeleteMultiple;

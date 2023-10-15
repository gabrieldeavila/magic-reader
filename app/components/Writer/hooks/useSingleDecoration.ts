import { useCallback } from "react";
import useGetCurrBlockId from "./useGetCurrBlockId";
import uuid from "../../../utils/uuid";
import { IText } from "../interface";
import { globalState, stateStorage } from "react-trigger-state";
import { useWriterContext } from "../context/WriterContext";

function useSingleDecoration({ id, text }) {
  const { getBlockId } = useGetCurrBlockId();
  const { contextName, handleUpdate, info } = useWriterContext();

  const saveDecoration = useCallback(
    (decoration: string) => {
      const { changedBlockId, currSelection } = getBlockId({
        textId: id,
      });

      const currBlock = text.find(({ id }) => id === changedBlockId);
      const prevDecoration = globalState.get("block_decoration");

      let options = currBlock.options;

      if (
        prevDecoration?.blockId === changedBlockId &&
        prevDecoration?.currSelection === currSelection
      ) {
        options = prevDecoration.options;
      }

      // if already has the decoration, remove it
      let newOptions = options.filter((option) => option !== decoration);

      if (options.includes(decoration)) {
        // remove the decoration
        newOptions = options.filter((option) => option !== decoration);
      } else {
        // add the decoration
        newOptions = [...options, decoration];
      }

      globalState.set("block_decoration", {
        options: newOptions,
        blockId: changedBlockId,
        currSelection,
      });

      return;
    },
    [getBlockId, id, text]
  );

  const addSingleDecoration = useCallback(
    (key: string) => {
      const { changedBlockId, currSelection } = getBlockId({
        textId: id,
      });
      const currBlock = text.find(({ id }) => id === changedBlockId);
      const blockDecoration = globalState.get("block_decoration") || {};
      const { options } = blockDecoration;

      const newId = uuid();
      const newBlock: IText = {
        id: newId,
        options,
        value: key,
      };

      if (
        !(
          options &&
          blockDecoration.blockId === changedBlockId &&
          blockDecoration.currSelection === currSelection
        )
      ) {
        return false;
      }

      if (currSelection === currBlock.value.length) {
        const newText = text.reduce((acc, curr) => {
          if (curr.id === changedBlockId) {
            return [...acc, curr, newBlock];
          }

          return [...acc, curr];
        }, []);

        handleUpdate(id, newText);
      } else if (currSelection === 0) {
        // add a new block in the beginning
        const newText = [newBlock, ...text];

        handleUpdate(id, newText);
      } else {
        // split the block into three
        const newText = text.reduce((acc, curr) => {
          if (curr.id === changedBlockId) {
            const firstHalf = {
              ...curr,
              value: curr.value.slice(0, currSelection),
              id: uuid(),
            };

            const secondHalf = {
              ...curr,
              value: curr.value.slice(currSelection),
              id: uuid(),
            };

            return [...acc, firstHalf, newBlock, secondHalf];
          }

          return [...acc, curr];
        }, []);

        handleUpdate(id, newText);
      }

      // use the new range as needed
      info.current = {
        selection: 1,
        blockId: newId,
      };
      stateStorage.set(`${contextName}_decoration-${newId}`, new Date());
      globalState.set("block_decoration", null);

      return true;
    },
    [contextName, getBlockId, handleUpdate, id, info, text]
  );

  return { saveDecoration, addSingleDecoration };
}

export default useSingleDecoration;

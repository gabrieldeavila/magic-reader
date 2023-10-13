import { useCallback } from "react";
import useGetCurrBlockId from "./useGetCurrBlockId";
import uuid from "../../../utils/uuid";
import { IText } from "../interface";
import { globalState, stateStorage } from "react-trigger-state";
import { useWriterContext } from "../context/WriterContext";

function useSingleDecoration({ id, text }) {
  const { getBlockId } = useGetCurrBlockId();
  const { contextName, handleUpdate, info } = useWriterContext();

  const addSingleDecoration = useCallback(
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

      if (currSelection === currBlock.value.length) {
        const newId = uuid();
        // add a new block in the end
        const newBlock: IText = {
          id: newId,
          options: newOptions,
          value: "",
        };

        const newText = [...text, newBlock];

        handleUpdate(id, newText);

        // use the new range as needed
        info.current = {
          selection: 0,
          blockId: newId,
        };

        stateStorage.set(`${contextName}_decoration-${newId}`, new Date());
      } else if (currSelection === 0) {
        // add a new block in the beginning
        const newId = uuid();
        const newBlock: IText = {
          id: newId,
          options: newOptions,
          value: "",
        };

        const newText = [newBlock, ...text];

        handleUpdate(id, newText);

        // use the new range as needed
        info.current = {
          selection: 0,
          blockId: newId,
        };

        stateStorage.set(`${contextName}_decoration-${newId}`, new Date());
      } else {
        // split the block into three

        const newId = uuid();
        const newBlock: IText = {
          id: newId,
          options: newOptions,
          value: "",
        };

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

        // use the new range as needed
        info.current = {
          selection: 0,
          blockId: newId,
        };

        stateStorage.set(`${contextName}_decoration-${newId}`, new Date());
      }
    },
    [contextName, getBlockId, handleUpdate, id, info, text]
  );

  return { addSingleDecoration };
}

export default useSingleDecoration;

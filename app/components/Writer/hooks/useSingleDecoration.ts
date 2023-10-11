import { useCallback } from "react";
import useGetCurrBlockId from "./useGetCurrBlockId";
import uuid from "../../../utils/uuid";
import { IText } from "../interface";
import { stateStorage } from "react-trigger-state";
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

      // if already has the decoration, remove it
      let newOptions = currBlock.options.filter(
        (option) => option !== decoration
      );

      if (currBlock.options.includes(decoration)) {
        // remove the decoration
        newOptions = currBlock.options.filter(
          (option) => option !== decoration
        );
      } else {
        // add the decoration
        newOptions = [...currBlock.options, decoration];
      }

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
      }
    },
    [contextName, getBlockId, handleUpdate, id, info, text]
  );

  return { addSingleDecoration };
}

export default useSingleDecoration;

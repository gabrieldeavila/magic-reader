"use client";

import { useCallback, useLayoutEffect, useRef } from "react";
import {
  globalState,
  stateStorage,
  useTriggerState,
} from "react-trigger-state";
import { useWriterContext } from "../../context/WriterContext";
import { IEditable, IWriterInfo } from "../../interface";
import Popup from "../../popup/Popup";
import { Editable } from "../../style";
import Decoration from "./Decoration";

function Component({ text, id }: IEditable) {
  const ref = useRef<HTMLDivElement>(null);

  const { contextName, handleUpdate, deleteBlock } = useWriterContext();
  const info = useRef<IWriterInfo>({
    selection: 0,
    blockId: 0,
  });

  const verifySpecialChars = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "Backspace") {
        event.preventDefault();
        const selection = window.getSelection();

        const changedBlockId = parseInt(
          selection.anchorNode.parentElement.getAttribute("data-block-id")
        );

        const currText = globalState
          .get(contextName)
          .find(({ id: textId }) => textId === id).text;

        const baseValue = selection.anchorNode.parentElement.innerText;

        const charToDelete = selection.anchorOffset - 1;

        const newValue =
          baseValue.slice(0, charToDelete) + baseValue.slice(charToDelete + 1);

        const newText = currText.map((item) => {
          if (item.id === changedBlockId) {
            item.value = newValue;
          }

          return item;
        });

        if (newValue.length === 0 && text.length > 1) {
          deleteBlock(id, changedBlockId);

          // the prev block is the last item before the current block
          const prevBlock = currText.find((_item, index) => {
            const nextBlock = currText[index + 1];

            return nextBlock?.id === changedBlockId;
          });

          info.current = {
            selection: prevBlock.value.length,
            blockId: prevBlock.id,
          };

          stateStorage.set(
            `${contextName}_decoration-${prevBlock.id}`,
            new Date()
          );
          return;
        }

        handleUpdate(id, newText);

        info.current = {
          selection: charToDelete,
          blockId: changedBlockId,
        };
      }
    },
    [contextName, deleteBlock, handleUpdate, id, text]
  );

  const handleChange = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      // only accept letters, numbers, spaces and special characters
      const allowedChars = /^[a-zA-Z0-9\s~`!@#$%^&*()_+={}[\]:;"'<>,.?/\\|-]+$/;

      const inputChar = event.key;

      const isAllowed = allowedChars.test(inputChar) && event.key.length === 1;

      if (!isAllowed) {
        verifySpecialChars(event);
        return;
      }

      event.preventDefault();

      const selection = window.getSelection();

      const changedBlockId = parseInt(
        selection.anchorNode.parentElement.getAttribute("data-block-id") ??
          // @ts-expect-error - this is a valid attribute
          selection.anchorNode.getAttribute?.("data-block-id") ??
          text[0].id
      );

      const currText = globalState
        .get(contextName)
        .find(({ id: textId }) => textId === id).text;

      const block = currText.find(({ id }) => id === changedBlockId);

      const baseValue = block?.value?.slice?.() ?? "";

      const newValue =
        baseValue.slice(0, selection.anchorOffset) +
        inputChar +
        baseValue.slice(selection.anchorOffset);

      const newText = currText.map((item) => {
        if (item.id === changedBlockId) {
          item.value = newValue;
        }

        return item;
      });

      handleUpdate(id, newText);

      info.current = {
        selection: selection.anchorOffset + 1,
        blockId: changedBlockId,
      };
    },
    [contextName, handleUpdate, id, text, verifySpecialChars]
  );

  const [selectionRange] = useTriggerState({
    name: "selection_range",
    initial: {},
  });

  useLayoutEffect(() => {
    if (!ref.current || selectionRange.start == null) return;

    info.current = {
      selection: 0,
      blockId: 0,
    };

    const selection = window.getSelection();
    const range = document.createRange();

    const startBlock = document.querySelector(
      `[data-block-id="${selectionRange.startBlockId}"]`
    )?.firstChild;

    const endBlock = document.querySelector(
      `[data-block-id="${selectionRange.endBlockId}"]`
    )?.firstChild;

    if (!startBlock || !endBlock) return;

    range.setStart(startBlock, selectionRange.start);
    range.setEnd(endBlock, selectionRange.end);

    selection.removeAllRanges();
    selection.addRange(range);
  }, [selectionRange]);

  return (
    <Editable
      ref={ref}
      onKeyDown={handleChange}
      contentEditable
      suppressContentEditableWarning
    >
      {text.map((item, index) => {
        return <Decoration {...{ ...item, info }} key={index} />;
      })}

      <Popup id={id} text={text} parentRef={ref} />
    </Editable>
  );
}

export default Component;

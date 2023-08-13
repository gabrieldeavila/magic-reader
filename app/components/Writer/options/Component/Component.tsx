"use client";

import { useCallback, useMemo, useRef } from "react";
import { globalState } from "react-trigger-state";
import { useWriterContext } from "../../context/WriterContext";
import { IEditable, IWriterInfo } from "../../interface";
import { Editable } from "../../style";
import Decoration from "./Decoration";

function Component({ text, id, position }: IEditable) {
  const ref = useRef<HTMLDivElement>(null);

  const { contextName, handleUpdate } = useWriterContext();
  const info = useRef<IWriterInfo>({
    selection: 0,
    blockId: 0,
  });
  // const { setRange } = useSetRange({ text, ref, ...props });

  // useEditable({ text, ...props, ref });
  const mimic = useMemo(
    () =>
      text.reduce((acc, item) => {
        const words = item.value.split("");

        words.forEach((word) => {
          acc.push({
            letter: word,
            id: item.id,
          });
        });

        return acc;
      }, []),
    [text]
  );

  const handleChange = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      // only accept letters, numbers, spaces and special characters
      const allowedChars = /^[a-zA-Z0-9\s~`!@#$%^&*()_+={}[\]:;"'<>,.?/\\|-]+$/;

      const inputChar = event.key;

      const isAllowed = allowedChars.test(inputChar) && event.key.length === 1;

      if (!isAllowed) {
        return;
      }

      event.preventDefault();

      const selection = window.getSelection();

      const changedBlockId = parseInt(
        selection.anchorNode.parentElement.getAttribute("data-block-id")
      );

      const currText = globalState
        .get(contextName)
        .find(({ id: textId }) => textId === id).text;

      const block = currText.find(({ id }) => id === changedBlockId);

      const baseValue = block.value.slice();

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

      handleUpdate(position, newText);

      info.current = {
        selection: selection.anchorOffset + 1,
        blockId: changedBlockId,
      };
    },
    [contextName, handleUpdate, id, position]
  );

  return (
    <Editable
      ref={ref}
      onKeyDown={handleChange}
      // onKeyDown={(e)=>console.log(e)}
      contentEditable
      suppressContentEditableWarning
    >
      {text.map((item, index) => {
        return <Decoration {...{ ...item, info }} key={index} />;
      })}
    </Editable>
  );
}

export default Component;

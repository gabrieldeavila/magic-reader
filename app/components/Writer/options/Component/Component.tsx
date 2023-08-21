"use client";

import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
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

        let changedBlockId = parseFloat(
          selection.anchorNode.parentElement.getAttribute("data-block-id")
        );

        const currText = globalState
          .get(contextName)
          .find(({ id: textId }) => textId === id).text;

        let baseValue = selection.anchorNode.parentElement.innerText;

        let charToDelete = selection.anchorOffset - 1;

        const isCodeBlock =
          selection.anchorNode.parentElement?.parentElement.tagName === "CODE";

        if (isCodeBlock) {
          const codeChilds = Array.from(
            selection.anchorNode.parentElement?.parentElement.childNodes
          );

          let newIndex = 0;

          codeChilds.find((item) => {
            if (item !== selection.anchorNode.parentElement) {
              newIndex += item.textContent?.length ?? 0;
              return false;
            }

            return true;
          });

          newIndex += selection.anchorOffset;

          charToDelete = newIndex - 1;
          changedBlockId = parseFloat(
            selection.anchorNode.parentElement.parentElement.parentElement.parentElement.getAttribute(
              "data-block-id"
            )
          );

          baseValue =
            selection.anchorNode.parentElement.parentElement.innerText;
        }

        // if the charToDelete is -1, it means that the cursor is at the beginning of the block
        // and we need to delete the previous block
        if (charToDelete === -1) {
          const prevBlock = currText.find((_item, index) => {
            const nextBlock = currText[index + 1];

            return nextBlock?.id === changedBlockId;
          });

          if (!prevBlock) return;

          const prevBlockValue = prevBlock.value;

          charToDelete = prevBlockValue.length - 1;

          baseValue = prevBlockValue;

          changedBlockId = prevBlock.id;
        }

        const newValue =
          baseValue.slice(0, charToDelete) + baseValue.slice(charToDelete + 1);

        const newText = currText.map((item) => {
          if (item.id === changedBlockId) {
            item.value = newValue;
          }

          return item;
        });

        // if the current block is empty and there are more than one block
        if (newValue.length === 0 && text.length > 1) {
          deleteBlock(id, changedBlockId);

          // the prev block is the last item before the current block
          const prevBlock = currText.find((_item, index) => {
            const nextBlock = currText[index + 1];

            return nextBlock?.id === changedBlockId;
          });

          if (!prevBlock) return;

          info.current = {
            selection: prevBlock?.value?.length ?? 0,
            blockId: prevBlock?.id,
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
      } else if (event.key === "Enter") {
        event.preventDefault();

        // gets the current block id
        const selection = window.getSelection();

        const changedBlockId = parseFloat(
          selection.anchorNode.parentElement.getAttribute("data-block-id")
        );

        const content = globalState.get(contextName);

        const currText = content.find(({ id: textId }) => textId === id).text;

        const block = currText.find(({ id }) => id === changedBlockId);

        const baseValue = block?.value?.slice?.() ?? "";

        // will create a new block with the text after the cursor
        const newValue = baseValue.slice(selection.anchorOffset);

        let foundBlock = false;

        // and will update the current block with the text before the cursor
        const { prevText, newLineText } = currText.reduce(
          (acc, item) => {
            if (item.id === changedBlockId) {
              item.value = baseValue.slice(0, selection.anchorOffset);
            }

            if (foundBlock) {
              acc.newLineText.push(item);
            } else {
              acc.prevText.push(item);
            }

            if (item.id === changedBlockId) {
              acc.newLineText.push({
                ...item,
                id: Math.random(),
                value: newValue,
              });

              foundBlock = true;
            }

            return acc;
          },
          {
            prevText: [],
            newLineText: [],
          }
        );

        const newContent = content.map((item) => {
          if (item.id === id) {
            item.text = prevText;
          }

          return item;
        });

        const newId = Math.random();

        newContent.splice(
          content.findIndex(({ id: textId }) => textId === id) + 1,
          0,
          {
            id: newId,
            text: newLineText,
          }
        );

        stateStorage.set(`${contextName}_decoration-${newId}`, new Date());
        stateStorage.set(contextName, newContent);
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

      const isCodeBlock =
        selection.anchorNode.parentElement?.parentElement.tagName === "CODE";

      const changedBlockId = parseFloat(
        isCodeBlock
          ? selection.anchorNode.parentElement.parentElement.parentElement.parentElement.getAttribute(
              "data-block-id"
            )
          : selection.anchorNode.parentElement.getAttribute("data-block-id") ??
              // @ts-expect-error - this is a valid attribute
              selection.anchorNode.getAttribute?.("data-block-id") ??
              text[0].id
      );

      const currText = globalState
        .get(contextName)
        .find(({ id: textId }) => textId === id).text;

      const block = currText.find(({ id }) => id === changedBlockId);

      const baseValue = block?.value?.slice?.() ?? "";

      let cursorPositionValue = selection.anchorOffset;

      if (isCodeBlock) {
        const codeChilds = Array.from(
          selection.anchorNode.parentElement?.parentElement.childNodes
        );

        let codeNewIndex = 0;

        codeChilds.find((item) => {
          if (item !== selection.anchorNode.parentElement) {
            codeNewIndex += item.textContent?.length ?? 0;
            return false;
          }

          return true;
        });

        codeNewIndex += selection.anchorOffset;

        cursorPositionValue = codeNewIndex;
      }

      const newValue =
        baseValue.slice(0, cursorPositionValue) +
        inputChar +
        baseValue.slice(cursorPositionValue);

      const newText = currText.map((item) => {
        if (item.id === changedBlockId) {
          item.value = newValue;
        }

        return item;
      });

      handleUpdate(id, newText);

      info.current = {
        selection: cursorPositionValue + 1,
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

    let startBlock = document.querySelector(
      `[data-block-id="${selectionRange.startBlockId}"]`
    )?.firstChild;

    let endBlock = document.querySelector(
      `[data-block-id="${selectionRange.endBlockId}"]`
    )?.firstChild;

    // if it's a code block, get the first child
    const isCodeBlock = startBlock?.firstChild?.nodeName === "CODE";

    if (isCodeBlock) {
      startBlock = startBlock?.firstChild;
      endBlock = endBlock?.firstChild;

      const startChilds = [];

      startBlock?.childNodes.forEach((item) => {
        startChilds.push(item);
      });

      const endChilds = [];

      endBlock?.childNodes.forEach((item) => {
        endChilds.push(item);
      });

      let startIndex = -1;
      let letterStartIndex = 0;

      const newStart = startChilds?.find((item) => {
        const letters = item.textContent?.split("") ?? [""];

        const hasLetterIndex = letters.find((item, index) => {
          startIndex++;
          const isTheOne = startIndex === selectionRange.start;

          if (isTheOne) {
            letterStartIndex = index;
          }

          return isTheOne;
        });

        return hasLetterIndex;
      });

      let endIndex = -1;
      let letterEndIndex = 0;

      const newEnd = endChilds?.find((item) => {
        const letters = item.textContent?.split("") ?? [""];

        const hasLetterIndex = letters.find((item, index) => {
          endIndex++;
          const isTheOne = endIndex === selectionRange.end - 1;

          if (isTheOne) {
            letterEndIndex = index;
          }

          return isTheOne;
        });

        return hasLetterIndex;
      });

      startBlock = newStart?.firstChild;
      endBlock = newEnd?.firstChild;

      selectionRange.start = letterStartIndex;
      selectionRange.end = letterEndIndex + 1;
    }

    if (!startBlock || !endBlock) {
      return;
    }

    range.setStart(startBlock, selectionRange.start);
    range.setEnd(endBlock, selectionRange.end);

    selection.removeAllRanges();
    selection.addRange(range);
  }, [selectionRange]);

  const [showPopup, setShowPopup] = useState(false);

  const checkSelection = useCallback(() => {
    setTimeout(() => {
      const selection = window.getSelection();
      const lettersSelected = selection.toString().length;

      const show = lettersSelected > 0;

      if (show) {
        stateStorage.set("force_popup_positions_update", new Date());
      }

      setShowPopup(show);
    });
  }, []);

  const handleSelect = useCallback(
    (ev: React.KeyboardEvent<HTMLDivElement>) => {
      const block = ev.nativeEvent.target;

      // if there is no block, it means that the user selected the text and then clicked on the popup
      if (block) {
        checkSelection();
        stateStorage.set("selection_range", null);
      }
    },
    [checkSelection]
  );

  const preventDefault = useCallback((ev: React.DragEvent<HTMLDivElement>) => {
    ev.preventDefault();
  }, []);

  const onlyOneBlockAndIsEmpty = useMemo(
    () => text.length === 1 && text[0].value.length === 0,
    [text]
  );

  return (
    <Editable
      ref={ref}
      onKeyDown={handleChange}
      contentEditable
      onSelectCapture={handleSelect}
      onDragStart={preventDefault}
      onDrop={preventDefault}
      onBlur={checkSelection}
      onFocus={checkSelection}
      suppressContentEditableWarning
    >
      {text.map((item, index) => {
        return (
          <Decoration
            {...{ ...item, info, onlyOneBlockAndIsEmpty }}
            parentText={text}
            key={index}
          />
        );
      })}

      {showPopup && <Popup id={id} text={text} parentRef={ref} />}
    </Editable>
  );
}

export default Component;

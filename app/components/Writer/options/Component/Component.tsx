"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  globalState,
  stateStorage,
  useTriggerState,
} from "react-trigger-state";
import { useWriterContext } from "../../context/WriterContext";
import useDeleteMultiple from "../../hooks/useDeleteMultiple";
import { IEditable, IWriterInfo } from "../../interface";
import Popup from "../../popup/Popup";
import { Editable } from "../../style";
import Decoration from "./Decoration";
import usePositions from "../../hooks/usePositions";
import useGetCurrBlockId from "../../hooks/useGetCurrBlockId";

const OPTIONS_CHARS = {
  bold: "**",
  italic: "<<<",
  underline: "__",
  strikethrough: "~~",
  code: "```",
  highlight: "^^^",
};

const CHARS_KEYS = Object.keys(OPTIONS_CHARS);

const CHARS_VALUES = Object.values(OPTIONS_CHARS);

function Component({ text, id }: IEditable) {
  const ref = useRef<HTMLDivElement>(null);

  const { contextName, handleUpdate, deleteBlock } = useWriterContext();
  const info = useRef<IWriterInfo>({
    selection: 0,
    blockId: 0,
  });

  const { deleteMultipleLetters } = useDeleteMultiple({ text, id, info });

  useEffect(() => {
    const isFirstSelected = globalState.get("first_selection") === id;

    if (!isFirstSelected) return;

    const selection = window.getSelection();

    const range = document.createRange();

    const firstBlock = text?.[0]?.id;

    if (!firstBlock) return;

    const block = document.querySelector(`[data-block-id="${firstBlock}"]`)
      ?.firstChild;

    const isCodeBlock = block?.firstChild?.nodeName === "CODE";

    if (!block) return;

    if (isCodeBlock) {
      range.setStart(block?.firstChild, 0);
      range.setEnd(block?.firstChild, 0);
    } else {
      range.setStart(block, 0);
      range.setEnd(block, 0);
    }

    selection.removeAllRanges();
    selection.addRange(range);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const verifySpecialChars = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (["Backspace", "Delete"].includes(event.key)) {
        event.preventDefault();

        // returns if is deleting in the right or left side of the block
        const deletingPosition = event.key === "Delete" ? 0 : -1;

        const selection = window.getSelection();

        let changedBlockId = parseFloat(
          selection.anchorNode.parentElement.getAttribute("data-block-id")
        );

        const currText = globalState
          .get(contextName)
          .find(({ id: textId }) => textId === id).text;

        let baseValue = selection.anchorNode.parentElement.innerText;

        let charToDelete = selection.anchorOffset + deletingPosition;
        // number of chars to delete
        const numberOfChars = selection.toString().length;

        if (numberOfChars) {
          deleteMultipleLetters();
          return;
        }

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

          charToDelete = newIndex + deletingPosition;
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

          charToDelete = prevBlockValue.length + deletingPosition;

          baseValue = prevBlockValue;

          changedBlockId = prevBlock.id;
        } else if (
          charToDelete === baseValue.length &&
          event.key === "Delete"
        ) {
          // gets the next block
          const nextBlock = currText.find((_item, index) => {
            const nextBlock = currText[index - 1];

            return nextBlock?.id === changedBlockId;
          });

          if (!nextBlock) return;

          const nextBlockValue = nextBlock.value;

          baseValue = nextBlockValue;

          charToDelete = 0;

          changedBlockId = nextBlock.id;
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

        const isCodeBlock =
          selection.anchorNode.parentElement?.parentElement?.tagName === "CODE";

        const changedBlockId = parseFloat(
          isCodeBlock
            ? selection.anchorNode.parentElement.parentElement.parentElement.parentElement.getAttribute(
                "data-block-id"
              )
            : selection.anchorNode.parentElement.getAttribute("data-block-id")
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

        globalState.set("first_selection", newId);

        stateStorage.set(`${contextName}_decoration-${newId}`, new Date());
        stateStorage.set(contextName, newContent);
      }
    },
    [
      contextName,
      deleteBlock,
      deleteMultipleLetters,
      handleUpdate,
      id,
      text.length,
    ]
  );

  const { getSelectedBlocks } = usePositions({ text });

  const copyText = useCallback(() => {
    const { selectedBlocks, last, first } = getSelectedBlocks();
    let copyStuff = "";

    selectedBlocks.forEach((item, index) => {
      const { value, options } = item;

      const isLast = index === selectedBlocks.length - 1;
      const isFirst = index === 0;

      const optionsToUse = options.reduce((acc, item) => {
        if (OPTIONS_CHARS[item]) {
          acc.push(OPTIONS_CHARS[item]);
        }

        return acc;
      }, []);

      const optionsRight = optionsToUse.join("");

      const optionsLeft = optionsToUse.reverse().join("");

      let usedValue = "";
      const letters = value.split("");
      if (isFirst) {
        letters.forEach((item, index) => {
          if (index > first.index - 1) {
            usedValue += item;
          }
        });
      } else if (isLast) {
        letters.forEach((item, index) => {
          if (index < last.index + 1) {
            usedValue += item;
          }
        });
      } else {
        usedValue = value;
      }

      copyStuff += `${optionsLeft}${usedValue}${optionsRight}`;
    });

    // copy the text to the clipboard
    navigator.clipboard.writeText(copyStuff);
  }, [getSelectedBlocks]);

  const handleCtrlEvents = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>, ctrlPressed: boolean) => {
      if (!ctrlPressed) return false;

      if (e.key === "x") {
        e.preventDefault();
        copyText();
        deleteMultipleLetters();

        return true;
      } else if (e.key === "c") {
        e.preventDefault();
        copyText();

        return true;
      } else if (e.key === "v") {
        return true;
      }
    },
    [copyText, deleteMultipleLetters]
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

      const ctrlPressed = event.ctrlKey;

      const avoidCtrl = handleCtrlEvents(event, ctrlPressed);

      if (avoidCtrl) return;

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
              text[0]?.id
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
    [contextName, handleCtrlEvents, handleUpdate, id, text, verifySpecialChars]
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
    const isCodeBlock =
      startBlock?.firstChild?.nodeName === "CODE" ||
      endBlock?.firstChild?.nodeName === "CODE";

    if (isCodeBlock) {
      if (startBlock?.firstChild?.nodeName === "CODE") {
        startBlock = startBlock?.firstChild;

        const startChilds = [];

        startBlock?.childNodes.forEach((item) => {
          startChilds.push(item);
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

        startBlock = newStart?.firstChild;
        selectionRange.start = letterStartIndex;
      }

      if (endBlock?.firstChild?.nodeName === "CODE") {
        endBlock = endBlock?.firstChild;

        const endChilds = [];

        endBlock?.childNodes.forEach((item) => {
          endChilds.push(item);
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

        endBlock = newEnd?.firstChild;

        selectionRange.end = letterEndIndex + 1;
      }
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

  const { getBlockId } = useGetCurrBlockId();

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLDivElement>) => {
      e.preventDefault();

      const copiedText = e.clipboardData.getData("text/plain");

      console.log(copiedText);

      // transforms the copiedText into an array of blocks
      // ex.: "^^^**H**^^^^^^***ell***^^^^^^o^^^" -> [{ value: "H", options: ["highlight", "bold"] }, { value: "ell", options: ["highlight", "bold","italic"] }, { value: "o", options: ["highlight"] }]

      const chars = copiedText.split("");

      let currOption = "";
      let endOption = "";
      let newWords = "";
      let searchingForTheEnd = false;

      const newBlocks = [];

      chars.forEach((item, index) => {
        if (searchingForTheEnd) {
          if (item === currOption[0]) {
            endOption += item;

            if (endOption === currOption) {
              searchingForTheEnd = false;
              newBlocks.push({
                value: newWords,
                options: [currOption],
              });

              currOption = "";
              newWords = "";
              endOption = "";
            }
          } else {
            newWords += endOption + item;
            endOption = "";
          }
          return;
        }

        if (currOption || CHARS_VALUES.some((char) => char.includes(item))) {
          currOption += item;

          const isAKey = CHARS_VALUES.includes(currOption);

          const isNextAKey = CHARS_VALUES.includes(
            currOption + chars[index + 1]
          );

          // if the current option is a key and the next one is not, it means that the current option is the end of the option and the start of the word
          if (isAKey && !isNextAKey) {
            searchingForTheEnd = true;

            if (newWords) {
              newBlocks.push({
                value: newWords,
                options: [],
              });

              newWords = "";
            }
          }

          return;
        }

        newWords += item;
      });

      if (newWords) {
        newBlocks.push({
          value: newWords,
          options: [],
        });
      }

      const blocksFormatted = newBlocks.map((item) => {
        const filteredOptions = [
          ...CHARS_VALUES.filter((char) => item.value.includes(char)),
          ...item.options,
        ];

        const newValue = filteredOptions.reduce((acc, char) => {
          return acc.replaceAll(char, "");
        }, item.value);

        return {
          value: newValue,
          id: Math.random() + new Date().getTime(),
          options: filteredOptions.map(
            (char) => CHARS_KEYS[CHARS_VALUES.indexOf(char)]
          ),
        };
      });

      const { changedBlockId, currSelection } = getBlockId();

      const newText = [];

      // console.log(text, blocksFormatted);
      text.forEach((item) => {
        if (item.id !== changedBlockId) {
          newText.push(item);
          return;
        }

        const { value, options } = item;

        const valueBefore = value.slice(0, currSelection);
        const valueAfter = value.slice(currSelection);

        newText.push({
          value: valueBefore,
          id: item.id,
          options,
        });

        blocksFormatted.forEach((item) => {
          newText.push(item);
        });

        newText.push({
          value: valueAfter,
          id: item.id + new Date().getTime(),
          options,
        });
      });

      const lastNewBlock = blocksFormatted[blocksFormatted.length - 1];

      // add the lastNewBlock focus
      info.current = {
        selection: lastNewBlock.value.length,
        blockId: lastNewBlock.id,
      };

      handleUpdate(id, newText);

      stateStorage.set(
        `${contextName}_decoration-${lastNewBlock.id}`,
        new Date()
      );
    },
    [contextName, getBlockId, handleUpdate, id, text]
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
      onClick={checkSelection}
      suppressContentEditableWarning
      onPaste={handlePaste}
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

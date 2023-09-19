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
import useGetCurrBlockId from "../../hooks/useGetCurrBlockId";
import usePositions from "../../hooks/usePositions";
import { IEditable } from "../../interface";
import Popup from "../../popup/Popup";
import { Editable } from "../../style";
import Decoration from "./Decoration";

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

function Component({ text, id, position }: IEditable) {
  const ref = useRef<HTMLDivElement>(null);
  const [keyDownEv] = useTriggerState({
    name: `key_down_ev-${id}`,
    initial: null,
  });

  const { contextName, handleUpdate, deleteBlock, deleteLine, info } =
    useWriterContext();

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

  const { getSelectedBlocks } = usePositions({ text });
  const { getBlockId } = useGetCurrBlockId();

  const verifySpecialChars = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (["Backspace", "Delete"].includes(event.key)) {
        event.preventDefault();

        // returns if is deleting in the right or left side of the block
        const deletingPosition = event.key === "Delete" ? 0 : -1;

        const selection = window.getSelection();

        // if both the anchorNode and the focusNode are 0, and the key is backspace, it means we have to mix the current block with the previous one
        if (
          selection.anchorNode === selection.focusNode &&
          selection.anchorOffset === selection.focusOffset &&
          selection.focusOffset === 0 &&
          event.key === "Backspace"
        ) {
          const content = globalState.get(contextName);

          const currTextIndex = content.findIndex(
            ({ id: textId }) => id === textId
          );

          const nextBlockIndex = currTextIndex - 1;

          const currText = content[currTextIndex].text;

          const prevBlock = content[currTextIndex - 1];

          if (!prevBlock) return;

          const newContent = content.reduce((acc, item, index) => {
            if (index === currTextIndex) {
              return acc;
            }

            if (index === nextBlockIndex) {
              acc.push({
                ...item,
                text: [...item.text, ...currText],
              });
            } else {
              acc.push(item);
            }

            return acc;
          }, []);

          const currTextFirstValue = currText[0];

          info.current = {
            selection: 0,
            blockId: currTextFirstValue.id,
          };

          stateStorage.set(
            `${contextName}_decoration-${prevBlock.id}`,
            new Date()
          );
          stateStorage.set(contextName, newContent);
          return;
        }
        const content = globalState.get(contextName);

        const currTextIndex = content.findIndex(
          ({ id: textId }) => id === textId
        );

        const currText = content[currTextIndex].text;

        let changedBlockId = parseFloat(
          selection.anchorNode.parentElement.getAttribute("data-block-id")
        );

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

        const isTheLastBlock =
          currText[currText.length - 1].id === changedBlockId;

        // now if is the delete key, we have to mix the current block with the next one
        if (
          selection.anchorNode === selection.focusNode &&
          selection.anchorOffset === selection.focusOffset &&
          selection.focusOffset === selection.focusNode.textContent.length &&
          event.key === "Delete" &&
          isTheLastBlock
        ) {
          const nextBlockIndex = currTextIndex + 1;

          const nextBlock = content[currTextIndex + 1];

          if (!nextBlock) return;
          const newContent = content.reduce((acc, item, index) => {
            if (index === currTextIndex) {
              return acc;
            }

            if (index === nextBlockIndex) {
              acc.push({
                ...item,
                text: [...currText, ...item.text],
              });
            } else {
              acc.push(item);
            }

            return acc;
          }, []);

          const currTextLastValue = currText[currText.length - 1];

          info.current = {
            selection: currTextLastValue?.value?.length,
            blockId: currTextLastValue?.id,
          };
          globalState.set("first_selection", null);

          stateStorage.set(contextName, newContent);

          stateStorage.set(
            `${contextName}_decoration-${currTextLastValue.id}`,
            new Date()
          );

          return;
        }

        // if the charToDelete is -1, it means that the cursor is at the beginning of the block
        // and we need to delete the previous block
        if (charToDelete === -1 && currText.length > 1) {
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

        const blockIndex = content.findIndex(({ id: newId }) => id === newId);
        const block = content[blockIndex];
        const prevValue = block.text[block.text.length - 1].value;

        // if the current block is empty and there are more than one block
        if (
          (prevValue.length === 0 ||
            (prevValue.length === 1 && prevValue === " ")) &&
          content.length > 1 &&
          block.text.length === 1
        ) {
          const newBlockIndex = blockIndex - 1;

          const newBlock = content[newBlockIndex];

          deleteLine(id);

          if (!newBlock) return;
          const prevLine = newBlock.text[newBlock.text.length - 1];

          // if is going up, the selection will be the last char of the prev block
          // otherwise, it will be the first char of the prev block
          const newSelection = content[blockIndex - 1]
            ? prevLine.value?.length
            : 0;

          info.current = {
            selection: newSelection,
            blockId: prevLine.id,
          };

          stateStorage.set(
            `${contextName}_decoration-${prevLine.id}`,
            new Date()
          );
          return;
        }

        if (newValue.length === 0 && text.length > 1) {
          // the prev block is the last item before the current block
          const prevBlock = currText.find((_item, index) => {
            const nextBlock = currText[index + 1];

            return nextBlock?.id === changedBlockId;
          });

          deleteBlock(id, changedBlockId);

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

        // if the newText is
        handleUpdate(id, newText);

        info.current = {
          selection: charToDelete,
          blockId: changedBlockId,
        };
      } else if (event.key === "Enter") {
        event.preventDefault();
        const isCtrlPressed = event.ctrlKey;

        if (isCtrlPressed) {
          const newId = Math.random();
          const newText = {
            id: newId,
            text: [
              {
                id: Math.random(),
                value: "",
                options: [],
              },
            ],
          };

          const content = globalState.get(contextName);

          // gets current block id and place the new block after it
          const newContent = content.reduce((acc, item) => {
            if (item.id === id) {
              acc.push(item);
              acc.push(newText);
            } else {
              acc.push(item);
            }

            return acc;
          }, []);

          globalState.set("first_selection", newId);

          stateStorage.set(`${contextName}_decoration-${newId}`, new Date());
          stateStorage.set(contextName, newContent);
          return;
        }

        // gets the current block id
        const selection = window.getSelection();

        // is codeblock if there is no data-block-id in the parent element
        const isCodeBlock =
          !selection.anchorNode.parentElement.getAttribute("data-block-id");

        const changedBlockId = parseFloat(
          isCodeBlock
            ? selection.anchorNode.parentElement.parentElement.parentElement.parentElement?.getAttribute?.(
                "data-block-id"
              ) ||
                selection.anchorNode.parentElement.parentElement.getAttribute(
                  "data-block-id"
                )
            : selection.anchorNode.parentElement.getAttribute("data-block-id")
        );

        const content = globalState.get(contextName);

        const currText = content.find(({ id: textId }) => textId === id).text;

        const block = currText.find(({ id }) => id === changedBlockId);

        const baseValue = block?.value?.slice?.() ?? "";

        let currSelection = selection.anchorOffset;

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

          currSelection = codeNewIndex;
        }

        // will create a new block with the text after the cursor
        const newValue = baseValue.slice(currSelection);

        let foundBlock = false;

        // and will update the current block with the text before the cursor
        const { prevText, newLineText } = currText.reduce(
          (acc, item) => {
            if (item.id === changedBlockId) {
              item.value = baseValue.slice(0, currSelection);
            }

            if (foundBlock) {
              acc.newLineText.push(item);
            } else {
              acc.prevText.push(item);
            }

            if (item.id === changedBlockId) {
              // prevents from adding white spaces
              if (newValue.length > 0) {
                acc.newLineText.push({
                  ...item,
                  id: Math.random(),
                  value: newValue,
                });
              }

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

        if (newLineText.length === 0) {
          newLineText.push({
            id: Math.random(),
            value: "",
            options: [],
          });
        }

        newContent.splice(
          content.findIndex(({ id: textId }) => textId === id) + 1,
          0,
          {
            id: newId,
            text: newLineText,
          }
        );

        stateStorage.set("first_selection", newId);

        info.current = {
          selection: 0,
          blockId: newId,
        };

        stateStorage.set(`${contextName}_decoration-${newId}`, new Date());
        stateStorage.set(contextName, newContent);
      }
    },
    [
      contextName,
      deleteBlock,
      deleteLine,
      deleteMultipleLetters,
      handleUpdate,
      id,
      info,
      text,
    ]
  );

  const copyEntireBlock = useCallback(() => {
    // copy all the text
    const currText = globalState
      .get(contextName)
      .find(({ id: textId }) => textId === id).text;

    const copyStuff = currText.reduce((acc, item) => {
      const { value, options } = item;

      const optionsToUse = options.reduce((acc, item) => {
        if (OPTIONS_CHARS[item]) {
          acc.push(OPTIONS_CHARS[item]);
        }

        return acc;
      }, []);

      const optionsRight = optionsToUse.join("");

      const optionsLeft = optionsToUse.reverse().join("");

      acc += `${optionsLeft}${value}${optionsRight}`;

      return acc;
    }, "");

    // copy the text to the clipboard
    navigator.clipboard.writeText(copyStuff);
  }, [contextName, id]);

  const copyText = useCallback(() => {
    if (!window.getSelection().toString().length) {
      copyEntireBlock();
      return;
    }

    const { selectedBlocks, last, first } = getSelectedBlocks();

    let copyStuff = "";

    selectedBlocks.forEach((item, index) => {
      const { value, options } = item;

      const isLast = index === selectedBlocks.length - 1;
      const isFirst = index === 0;
      const isOnlyOne = selectedBlocks.length === 1;

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

      if (isOnlyOne) {
        letters.forEach((item, index) => {
          if (index > first.index - 1 && index < last.index + 1) {
            usedValue += item;
          }
        });
      } else if (isFirst) {
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
  }, [copyEntireBlock, getSelectedBlocks]);

  const handleCtrlEvents = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>, ctrlPressed: boolean) => {
      if (!ctrlPressed) return false;

      if (e.key === "x") {
        e.preventDefault();
        copyText();
        const length = window.getSelection().toString().length;
        if (length > 0) {
          deleteMultipleLetters();
        } else {
          const nextLine = globalState.get(contextName)[position + 1]?.text[0];

          deleteLine(id);
          if (nextLine) {
            info.current = {
              selection: 0,
              blockId: nextLine.id,
            };

            stateStorage.set(
              `${contextName}_decoration-${nextLine.id}`,
              new Date()
            );
          }
        }

        return true;
      } else if (e.key === "c") {
        e.preventDefault();
        copyText();

        return true;
      } else if (["v", "r"].includes(e.key)) {
        return true;
      }

      return false;
    },
    [contextName, copyText, deleteLine, deleteMultipleLetters, id, info, position]
  );

  const verifyForAccents = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      const accents = ["Quote", "BracketLeft"];

      const lastChar = globalState.get("last_char");

      const isLastAccented = accents.includes(lastChar);
      const nowTheCharIsAccented = accents.includes(event.code);
      let valueToReturn: string | false = false;

      if (isLastAccented && nowTheCharIsAccented && lastChar === event.code) {
        const isShiftPressed = event.shiftKey;

        const accentsOptions = {
          Quote: isShiftPressed ? "^" : "~",
          BracketLeft: isShiftPressed ? "`" : "´",
        };

        valueToReturn = accentsOptions[lastChar];
      }

      globalState.set("last_char", event.code);

      return valueToReturn;
    },
    []
  );

  const handleChange = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      // only accept letters, numbers, spaces, special characters and accents
      const allowedChars =
        /^[a-zA-Z0-9\s~`!@#$%^&*()_+={}[\]:;"'<>,.?/\\|-À-ÖØ-öø-ÿ|~]+$/;

      let inputChar = event.key;

      const isAllowed = allowedChars.test(inputChar) && event.key.length === 1;

      const newChar = verifyForAccents(event);

      if (!isAllowed && newChar !== false) {
        inputChar = newChar;
      } else if (!isAllowed) {
        verifySpecialChars(event);
        return;
      }

      const ctrlPressed = event.ctrlKey;

      const avoidCtrl = handleCtrlEvents(event, ctrlPressed);

      if (avoidCtrl) return;

      event.preventDefault();

      const selection = window.getSelection();

      const numberOfChars = selection.toString().length;

      if (numberOfChars) {
        deleteMultipleLetters();
      }

      setTimeout(() => {
        const selection = window.getSelection();
        const currText = globalState
          .get(contextName)
          .find(({ id: textId }) => textId === id).text;

        const isCodeBlock =
          selection.anchorNode.parentElement?.parentElement.tagName === "CODE";

        const changedBlockId = parseFloat(
          isCodeBlock
            ? selection.anchorNode.parentElement.parentElement.parentElement.parentElement.getAttribute(
                "data-block-id"
              )
            : selection.anchorNode.parentElement.getAttribute(
                "data-block-id"
              ) ??
                // @ts-expect-error - this is a valid attribute
                selection.anchorNode.getAttribute?.("data-block-id") ??
                currText[0]?.id
        );

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
      });
    },
    [
      contextName,
      deleteMultipleLetters,
      handleCtrlEvents,
      handleUpdate,
      id,
      info,
      verifyForAccents,
      verifySpecialChars,
    ]
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
  }, [info, selectionRange]);

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

  const [hasFocusId] = useTriggerState({
    name: `has_focus_ev-${id}`,
    initial: false,
  });

  const onlyOneBlockAndIsEmpty = useMemo(
    () => hasFocusId && text.length === 1 && text[0].value.length === 0,
    [hasFocusId, text]
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLDivElement>) => {
      e.preventDefault();

      const copiedText = e.clipboardData.getData("text/plain");
      const selection = window.getSelection();

      const numberOfChars = selection.toString().length;

      if (numberOfChars) {
        deleteMultipleLetters();
      }

      setTimeout(() => {
        const { changedBlockId, currSelection } = getBlockId({ textId: id });

        const currText = globalState
          .get(contextName)
          .find(({ id: textId }) => textId === id)?.text;

        if (!currText) return;

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

        const newText = [];

        currText.forEach((item) => {
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

        if (lastNewBlock == null) return;

        // add the lastNewBlock focus
        info.current = {
          selection: lastNewBlock?.value?.length,
          blockId: lastNewBlock?.id,
        };

        handleUpdate(id, newText);

        stateStorage.set(
          `${contextName}_decoration-${lastNewBlock.id}`,
          new Date()
        );
      });
    },
    [contextName, deleteMultipleLetters, getBlockId, handleUpdate, id, info]
  );

  useEffect(() => {
    if (keyDownEv == null) return;

    handleChange(keyDownEv.e);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyDownEv]);

  const [blurEv] = useTriggerState({
    name: `blur_ev-${id}`,
    initial: null,
  });

  useEffect(() => {
    if (blurEv == null) return;

    checkSelection();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blurEv]);

  const [dragEv] = useTriggerState({
    name: `drag_ev-${id}`,
    initial: null,
  });

  useEffect(() => {
    if (dragEv == null) return;

    preventDefault(dragEv.e);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dragEv]);

  const [selectEv] = useTriggerState({
    name: `select_ev-${id}`,
    initial: null,
  });

  useEffect(() => {
    if (selectEv == null) return;

    handleSelect(selectEv.e);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectEv]);

  const [pasteEv] = useTriggerState({
    name: `paste_ev-${id}`,
    initial: null,
  });

  useEffect(() => {
    if (pasteEv == null) return;

    handlePaste(pasteEv.e);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pasteEv]);

  return (
    <Editable
      ref={ref}
      contentEditable
      data-line-id={id}
      data-scribere
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

      {showPopup && hasFocusId && <Popup id={id} text={text} parentRef={ref} />}
    </Editable>
  );
}

export default Component;

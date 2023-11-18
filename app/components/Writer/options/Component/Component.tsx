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
import { dga } from "../../../../utils/dga";
import { dgb } from "../../../../utils/dgb";
import { dgs } from "../../../../utils/dgs";
import uuid from "../../../../utils/uuid";
import { useWriterContext } from "../../context/WriterContext";
import useCustomComps from "../../hooks/useCustomComps";
import useDeleteMultiple from "../../hooks/useDeleteMultiple";
import useGetCurrBlockId from "../../hooks/useGetCurrBlockId";
import usePasteBlocks from "../../hooks/usePasteBlocks";
import usePositions from "../../hooks/usePositions";
import useSingleDecoration from "../../hooks/useSingleDecoration";
import { IEditable, ILinesBetween, IText, prevLineInfo } from "../../interface";
import Popup from "../../popup/Popup";
import { PopupFunctions } from "../../popup/interface";
import { Editable } from "../../style";
import Image from "../img/Image";
import Decoration from "./Decoration";

function Component({
  type,
  text,
  align,
  id,
  position,
  customStyle,
}: IEditable) {
  const ref = useRef<HTMLDivElement>(null);
  const [keyDownEv] = useTriggerState({
    name: `key_down_ev-${id}`,
    initial: null,
  });

  const popupRef = useRef<PopupFunctions>({});

  const {
    contextName,
    handleUpdate,
    handleAddImg,
    deleteBlock,
    deleteLine,
    addToCtrlZ,
    info,
  } = useWriterContext();

  const { saveDecoration, addSingleDecoration } = useSingleDecoration({
    id,
    text,
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

    if (!block) {
      const span = document.querySelector(`[data-block-id="${firstBlock}"]`);

      range.setStart(span, 0);
      range.setEnd(span, 0);
      selection.removeAllRanges();
      selection.addRange(range);
      return;
    }

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
        const ctrlPressed = event.ctrlKey;

        // returns if is deleting in the right or left side of the block
        const deletingPosition = event.key === "Delete" ? 0 : -1;

        const selection = window.getSelection();
        const { changedBlockId: oldBlockId } = getBlockId({ textId: id });
        const isFirstBlock = text[0].id === oldBlockId;

        addToCtrlZ({
          lineId: id,
          value: structuredClone(text),
          action: "delete_letters",
          blockId: oldBlockId,
        });

        // if both the anchorNode and the focusNode are 0, and the key is backspace, it means we have to mix the current block with the previous one
        if (
          selection.anchorNode === selection.focusNode &&
          selection.anchorOffset === selection.focusOffset &&
          selection.focusOffset === 0 &&
          isFirstBlock &&
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

        let changedBlockId =
          selection.anchorNode.parentElement.getAttribute("data-block-id");

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

        let isLastCodeChild = false;

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
          changedBlockId =
            selection.anchorNode.parentElement.parentElement.parentElement.parentElement.getAttribute(
              "data-block-id"
            );

          baseValue =
            selection.anchorNode.parentElement.parentElement.innerText;

          const lastChild =
            selection.anchorNode.parentElement.parentElement.lastChild;
          isLastCodeChild = lastChild === selection.anchorNode.parentElement;
        }

        const isTheLastBlock =
          currText[currText.length - 1].id === changedBlockId;

        if (ctrlPressed) {
          const { selectedLetters, lastNodeIndex, firstNodeIndex } =
            getSelectedBlocks();

          // gets where there is a space in the selected letters
          let spaceIndex = -1;

          const startLetter =
            selectedLetters?.[
              firstNodeIndex - (event.key === "Backspace" ? 1 : -1)
            ];

          // if start with a space, it will delete until the first letter
          const startWithSpace = startLetter.letter === " ";

          if (event.key === "Backspace") {
            selectedLetters.find(({ letter }, index) => {
              const letterToCheck = startWithSpace
                ? letter !== " "
                : letter === " ";

              if (letterToCheck && index != lastNodeIndex) {
                spaceIndex = index;
                return false;
              }

              return index === lastNodeIndex;
            });
          } else {
            spaceIndex = selectedLetters.findIndex(({ letter }, index) => {
              const letterToCheck = startWithSpace
                ? letter !== " "
                : letter === " ";

              return letterToCheck && index > firstNodeIndex;
            });

            if (spaceIndex === -1) {
              spaceIndex = selectedLetters.length - 1;
            }

            if (startWithSpace) {
              spaceIndex = spaceIndex - 1;
            }
          }

          spaceIndex += 1;

          // gets the letters between the space and the last selected letter
          let lettersToDelete = [];

          if (event.key === "Backspace") {
            lettersToDelete = selectedLetters.slice(
              spaceIndex,
              lastNodeIndex + 1
            );
          } else {
            lettersToDelete = selectedLetters.slice(firstNodeIndex, spaceIndex);
          }

          const blocksIds = lettersToDelete.reduce((acc, item) => {
            if (!acc.includes(item.id)) {
              acc.push(item.id);
            }

            return acc;
          }, []);

          // reduces the text of the blocks
          const newLineText = currText.reduce((acc, item, index, array) => {
            if (blocksIds.includes(item.id)) {
              item.value = item.value.split("").reduce((acc, letter, key) => {
                if (
                  !lettersToDelete.find(
                    ({ index, id }) => index === key && id === item.id
                  )
                ) {
                  acc += letter;
                }

                return acc;
              }, "");
            }

            if (item.value.length > 0 || index === array.length - 1) {
              acc.push(item);
            }

            return acc;
          }, []);

          stateStorage.set(contextName, [
            ...content.slice(0, currTextIndex),
            {
              ...content[currTextIndex],
              text: newLineText,
            },
            ...content.slice(currTextIndex + 1),
          ]);

          const newSelection = selectedLetters[spaceIndex - 1];

          if (event.key === "Delete") {
            const lettersDeletedFromThisBlock = lettersToDelete.filter(
              ({ id }) => id === newSelection?.id
            );
            newSelection.index =
              newSelection.index - lettersDeletedFromThisBlock.length;
          }

          if (!newSelection) return;

          info.current = {
            selection: newSelection.index + 1,
            blockId: newSelection.id,
          };

          stateStorage.set(
            `${contextName}_decoration-${newSelection.id}`,
            new Date()
          );

          return;
        }

        // now if is the delete key, we have to mix the current block with the next one
        if (
          selection.anchorNode === selection.focusNode &&
          selection.anchorOffset === selection.focusOffset &&
          (selection.focusOffset === selection.focusNode.textContent.length ||
            currText[currText.length - 1].value.length === 0) &&
          isTheLastBlock &&
          (isLastCodeChild || !isCodeBlock) &&
          event.key === "Delete"
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
          (prevValue.length === -1 ||
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
        const textClone = structuredClone(text);

        const isCtrlPressed = event.ctrlKey;

        if (isCtrlPressed) {
          const newId = uuid();
          const newText = {
            id: newId,
            type,
            align,
            text: [
              {
                id: uuid(),
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
          stateStorage.set(contextName, newContent);

          stateStorage.set(`${contextName}_decoration-${newId}`, new Date());
          info.current = {
            selection: 0,
            blockId: newId,
          };

          // add to the undo
          addToCtrlZ({
            lineId: newId,
            action: "add_line",
            position,
          });
          return;
        }

        // gets the current block id
        const selection = window.getSelection();

        // is codeblock if there is no data-block-id in the parent element
        const isCodeBlock =
          !selection.anchorNode.parentElement.getAttribute("data-block-id");

        const changedBlockId = isCodeBlock
          ? selection.anchorNode.parentElement.parentElement.parentElement.parentElement?.getAttribute?.(
              "data-block-id"
            ) ||
            selection.anchorNode.parentElement.parentElement.getAttribute(
              "data-block-id"
            )
          : selection.anchorNode.parentElement.getAttribute("data-block-id");

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
                  id: uuid(),
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

        const newId = uuid();

        // only changes the type to "p"
        if (
          newLineText.length === 0 &&
          prevText.length === 1 &&
          prevText[0]?.value === "" &&
          ["bl", "tl", "nl"].includes(type)
        ) {
          const newContent = content.map((item) => {
            if (item.id === id) {
              item.type = "p";
            }

            return item;
          });

          stateStorage.set(`update_${type}`, new Date());
          stateStorage.set(contextName, newContent);
          return;
        }

        if (newLineText.length === 0) {
          newLineText.push({
            id: uuid(),
            value: "",
            options: [],
          });
        }

        newContent.splice(
          content.findIndex(({ id: textId }) => textId === id) + 1,
          0,
          {
            id: newId,
            type,
            align,
            text: newLineText,
          }
        );

        stateStorage.set("first_selection", newId);

        addToCtrlZ({
          lineId: newId,
          action: "add_line",
          position,
          prevLineInfo: {
            type,
            align,
            id,
            text: textClone,
          },
        });

        info.current = {
          selection: 0,
          blockId: newId,
        };

        stateStorage.set(`${contextName}_decoration-${newId}`, new Date());
        stateStorage.set(contextName, newContent);
      }
    },
    [
      addToCtrlZ,
      align,
      contextName,
      deleteBlock,
      deleteLine,
      deleteMultipleLetters,
      getBlockId,
      getSelectedBlocks,
      handleUpdate,
      id,
      info,
      position,
      text,
      type,
    ]
  );

  const copyEntireBlock = useCallback(() => {
    // copy all the text
    const lineId = document.querySelector(`[data-line-id="${id}"]`);

    // Create a Blob for the HTML content and a Blob for the plain text
    const htmlBlob = new Blob([lineId.outerHTML], { type: "text/html" });
    // @ts-expect-error - it sure is a text
    const textBlob = new Blob([lineId.innerText], { type: "text/plain" });

    // Create a ClipboardItem with both HTML and text representations
    const clipboardItem = new ClipboardItem({
      "text/html": htmlBlob,
      "text/plain": textBlob,
    });

    // Use the Clipboard API to copy the modified content
    navigator.clipboard.write([clipboardItem]);
  }, [id]);

  const copyText = useCallback(() => {
    const selection = window.getSelection();
    if (!selection.toString().length) {
      copyEntireBlock();
      return;
    }

    // Create a new div element to hold the selected text
    let textCopied = selection.getRangeAt(0).cloneContents();

    if (!textCopied.querySelector("[data-block-id]")) {
      const { changedBlockId, isCodeBlock } = getBlockId({ textId: id });

      if (isCodeBlock) {
        const code = document.createElement("code");
        code.appendChild(textCopied);

        // @ts-expect-error - it sure is a text
        textCopied = code;
      } else {
        // gets the style of the block
        const block = document.querySelector(
          `[data-block-id="${changedBlockId}"]`
        );
        const parent = block?.parentElement;

        const type = block?.tagName === "SPAN" ? parent : block;

        const style = type?.getAttribute("style");
        const tag = type?.tagName;

        const allProps = (type?.getAttributeNames() ?? []).reduce(
          (acc, item) => {
            acc[item] = type?.getAttribute(item);
            return acc;
          },
          {}
        );

        const span = document.createElement(tag);
        span.setAttribute("style", style ?? "");
        span.appendChild(textCopied);

        // adds all the props
        Object.keys(allProps).forEach((item) => {
          span.setAttribute(item, allProps[item]);
        });

        // @ts-expect-error - it sure is a text
        textCopied = span;
      }
    }

    // Create a Blob for the HTML content and a Blob for the plain text
    const div = document.createElement("div");
    let textBaseCopy = null;

    const copiedChildren = Array.from(textCopied.children);

    const setStyle = (items: HTMLElement[], type: string) => {
      let newHTML,
        newText = "";

      if (type === "tl") {
        // todo list
        newHTML = document.createElement("ul");

        items.forEach((item) => {
          const li = document.createElement("li");
          // add the checked attribute
          const isChecked =
            item
              .querySelector("[data-todo-checked]")
              ?.getAttribute("data-todo-checked") === "true";

          const childrenFiltered = Array.from(item.children).filter(
            (item) => !item.getAttribute("data-popup")
          );

          // add [ ] or [x] to the text
          li.appendChild(document.createTextNode(isChecked ? "[x] " : "[ ] "));
          li.append(...childrenFiltered);

          // add in a similar way of a markdown
          newText += `- ${li.innerText}\n`;

          // add style
          li.style.listStyleType = "decimal";

          if (isChecked) {
            li.setAttribute("checked", "checked");
          }

          newHTML.appendChild(li);
        });
      } else if (type === "bl") {
        // bullet list
        newHTML = document.createElement("ul");

        items.forEach((item) => {
          const li = document.createElement("li");

          const childrenFiltered = Array.from(item.children).filter(
            (item) => !item.getAttribute("data-popup")
          );

          li.append(...childrenFiltered);

          newText += `- ${li.innerText}\n`;

          newHTML.appendChild(li);
        });
      } else if (type === "nl") {
        // number list
        newHTML = document.createElement("ol");

        items.forEach((item, index) => {
          const li = document.createElement("li");

          const childrenFiltered = Array.from(item.children).filter(
            (item) => !item.getAttribute("data-popup")
          );

          li.append(...childrenFiltered);

          newText += `${++index}. ${li.innerText}\n`;

          newHTML.appendChild(li);
        });
      }

      return [newHTML, newText];
    };

    if (copiedChildren.length) {
      let currType = "";
      let newChildren = [];

      const typesToAgroup = ["bl", "nl", "tl"];

      const { html: htmlToCopy, text: textToCopy } = copiedChildren.reduce(
        (acc, item: HTMLDivElement) => {
          const compType = item.getAttribute("data-component");

          if (typesToAgroup.includes(compType) && compType === currType) {
            newChildren.push(item);
          } else if (typesToAgroup.includes(compType)) {
            if (newChildren.length > 0) {
              const [newDiv, newText] = setStyle(newChildren, currType);

              acc.html.push(newDiv);
              acc.text.push(newText);
            }

            currType = compType;
            newChildren = [item];
          } else {
            if (newChildren.length > 0) {
              const [newDiv, newText] = setStyle(newChildren, currType);

              acc.html.push(newDiv);
              acc.text.push(newText);
            }

            newChildren = [];

            acc.html.push(item);
            acc.text.push(item.innerText);
          }

          return acc;
        },
        { html: [], text: [] }
      );

      const [newDiv, newText] = setStyle(newChildren, currType);

      if (newDiv) {
        htmlToCopy.push(newDiv);
      }

      if (newText) {
        textToCopy.push(newText);
      }

      div.innerHTML = "";
      div.append(...htmlToCopy);

      textBaseCopy = textToCopy.join("\n");
    } else {
      div.appendChild(textCopied);
    }

    // removes all children with data-popup
    const popups = div.querySelectorAll("[data-popup]");
    popups.forEach((item) => {
      item.remove();
    });

    const htmlBlob = new Blob([div.innerHTML], { type: "text/html" });
    const textBlob = new Blob([textBaseCopy ?? div.innerText], {
      type: "text/plain",
    });

    // Create a ClipboardItem with both HTML and text representations
    const clipboardItem = new ClipboardItem({
      "text/html": htmlBlob,
      "text/plain": textBlob,
    });

    // Use the Clipboard API to copy the modified content
    navigator.clipboard.write([clipboardItem]);
  }, [copyEntireBlock, getBlockId, id]);

  const handleCtrlEvents = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>, ctrlPressed: boolean) => {
      if (!ctrlPressed) return false;
      const popupActions = document.querySelector("[data-popup]");

      if (e.key === "x") {
        e.preventDefault();
        copyText();
        const length = window.getSelection().toString().length;
        if (length > 0) {
          deleteMultipleLetters();
        } else {
          const nextLine = globalState.get(contextName)[position + 1]?.text[0];
          const currLine = globalState.get(contextName)[position];

          addToCtrlZ({
            lineId: id,
            prevLineInfo: currLine,
            action: "delete_line",
            position: position + 1,
          });

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
        // e.preventDefault();
        copyText();

        return true;
      } else if (["v", "r"].includes(e.key)) {
        return true;
      } else if (["a"].includes(e.key)) {
        // selects all the text
        e.preventDefault();
        const shouldSelectAllContent =
          globalState.get("select_all_content") === id;

        let firstBlock = text?.[0]?.id;
        let lastBlock = text?.[text.length - 1]?.id;

        if (shouldSelectAllContent) {
          globalState.set("select_all_content", null);
          const content = globalState.get(contextName);
          firstBlock = content[0]?.text[0]?.id;
          lastBlock =
            content[content.length - 1]?.text[
              content[content.length - 1]?.text.length - 1
            ]?.id;
        } else {
          globalState.set("select_all_content", id);
        }

        const selection = window.getSelection();

        const range = document.createRange();

        if (!firstBlock || !lastBlock) return true;

        const first = dgb(firstBlock);

        const last = dgb(lastBlock, false);

        if (!first || !last) return true;

        range.setStart(first, 0);

        range.setEnd(last, last.textContent?.length ?? 0);

        selection.removeAllRanges();
        selection.addRange(range);
        return true;
      } else if (e.key === "b") {
        e.preventDefault();

        if (!popupActions) {
          saveDecoration("bold");
        } else {
          // @ts-expect-error - fix later
          popupActions.querySelector("[data-bold]").click();
        }

        return true;
      } else if (e.key === "i") {
        e.preventDefault();
        if (!popupActions) {
          saveDecoration("italic");
        } else {
          // @ts-expect-error - fix later
          popupActions.querySelector("[data-italic]").click();
        }
        return true;
      } else if (e.key === "u") {
        e.preventDefault();
        if (!popupActions) {
          saveDecoration("underline");
        } else {
          // @ts-expect-error - fix later
          popupActions.querySelector("[data-underline]").click();
        }

        return true;
      } else if (e.key === "s") {
        e.preventDefault();
        if (!popupActions) {
          saveDecoration("strikethrough");
        } else {
          // @ts-expect-error - fix later
          popupActions.querySelector("[data-strikethrough]").click();
        }
        return true;
      } else if (e.key === "h") {
        e.preventDefault();
        if (!popupActions) {
          saveDecoration("highlight");
        } else {
          // @ts-expect-error - fix later
          popupActions.querySelector("[data-highlight]").click();
        }
        return true;
      } else if (e.key === "e") {
        e.preventDefault();
        if (!popupActions) {
          saveDecoration("code");
        } else {
          // @ts-expect-error - fix later
          popupActions.querySelector("[data-code]").click();
        }
        return true;
      } else if (e.key === "Backspace") {
        e.preventDefault();
        return true;
      }

      return true;
    },
    [
      saveDecoration,
      addToCtrlZ,
      contextName,
      copyText,
      deleteLine,
      deleteMultipleLetters,
      id,
      info,
      position,
      text,
    ]
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

  const handleAltEvents = useCallback(
    (e) => {
      const isAltPressed = e.altKey;
      const isShiftPressed = e.shiftKey;

      if (!isAltPressed) return false;
      e.preventDefault();

      if (isShiftPressed) {
        const content = globalState.get(contextName);
        const currLine = content.find(({ id: textId }) => id === textId);

        // changes the ids and the values
        const newLine = {
          ...currLine,
          id: uuid(),
          text: currLine.text.map((item) => {
            const newId = uuid();

            return {
              ...item,
              id: newId,
            };
          }),
        };

        const currTextIndex = content.findIndex(
          ({ id: textId }) => id === textId
        );

        const newContent = content.reduce((acc, item, index) => {
          if (e.key === "ArrowUp" && index === currTextIndex) {
            addToCtrlZ({
              lineId: id,
              prevLineInfo: newLine,
              action: "up_copy",
            });

            acc.push(newLine);
          }

          acc.push(item);

          if (e.key === "ArrowDown" && index === currTextIndex) {
            addToCtrlZ({
              lineId: id,
              prevLineInfo: newLine,
              action: "down_copy",
            });

            acc.push(newLine);
          }

          return acc;
        }, []);

        const { changedBlockId, currSelection } = getBlockId({ textId: id });

        const blockIndex = currLine.text.findIndex(
          ({ id: blockId }) => blockId === changedBlockId
        );

        stateStorage.set(contextName, newContent);

        const newBlockId = newLine.text[blockIndex].id;

        info.current = {
          selection: currSelection,
          blockId: newBlockId,
        };

        stateStorage.set(`${contextName}_decoration-${newBlockId}`, new Date());

        return true;
      } else if (e.key === "ArrowUp") {
        // gets the content and add the line above the curr position
        e.preventDefault();

        const content = globalState.get(contextName);

        const currTextIndex = content.findIndex(
          ({ id: textId }) => id === textId
        );

        const prevLine = content[currTextIndex - 1];

        if (!prevLine) return;

        const newContent = content.reduce((acc, item, index) => {
          if (index === currTextIndex) {
            return acc;
          }

          if (index === currTextIndex - 1) {
            acc.push(content[currTextIndex]);
            acc.push(item);
          } else {
            acc.push(item);
          }

          return acc;
        }, []);

        const { changedBlockId, currSelection } = getBlockId({ textId: id });

        stateStorage.set(contextName, newContent);

        info.current = {
          selection: currSelection,
          blockId: changedBlockId,
        };

        globalState.set("arrow_move", true);

        addToCtrlZ({
          lineId: id,
          action: "up",
        });

        stateStorage.set(
          `${contextName}_decoration-${changedBlockId}`,
          new Date()
        );
        return true;
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        globalState.set("arrow_move", true);

        const content = globalState.get(contextName);

        const currTextIndex = content.findIndex(
          ({ id: textId }) => id === textId
        );

        const nextLine = content[currTextIndex + 1];

        if (!nextLine) return;

        const newContent = content.reduce((acc, item, index) => {
          if (index === currTextIndex) {
            return acc;
          }

          if (index === currTextIndex + 1) {
            acc.push(item);
            acc.push(content[currTextIndex]);
          } else {
            acc.push(item);
          }

          return acc;
        }, []);

        stateStorage.set(contextName, newContent);

        const { changedBlockId, currSelection } = getBlockId({ textId: id });

        stateStorage.set(contextName, newContent);

        info.current = {
          selection: currSelection,
          blockId: changedBlockId,
        };

        addToCtrlZ({
          lineId: id,
          action: "down",
        });

        setTimeout(() => {
          stateStorage.set(
            `${contextName}_decoration-${changedBlockId}`,
            new Date()
          );
        });
        return true;
      }

      return false;
    },
    [addToCtrlZ, contextName, getBlockId, id, info]
  );

  // if  ", ' and ( are pressed, it will add the closing char
  const addCustomChar = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>, inputChar: string) => {
      const selection = window.getSelection();
      const length = selection.toString().length;

      const OPTIONS = {
        "'": "'",
        // eslint-disable-next-line @typescript-eslint/quotes
        '"': '"',
        "(": ")",
        "[": "]",
        "{": "}",
      };

      // eslint-disable-next-line @typescript-eslint/quotes
      const isCustom = length && Object.keys(OPTIONS).includes(inputChar);

      if (!isCustom) return false;

      const content = globalState.get(contextName);

      const [startNode, endNode] = dgs();

      const startLine = content.find(
        ({ id: textId }) => textId === startNode.lineId
      )?.text;

      const endLine = content.find(
        ({ id: textId }) => textId === endNode.lineId
      )?.text;

      const startBlock = startLine?.find(
        ({ id: blockId }) => blockId === startNode.blockId
      );

      const endBlock = endLine?.find(
        ({ id: blockId }) => blockId === endNode.blockId
      );

      // add the closing char
      const newStartBlock = {
        ...startBlock,
        value:
          startBlock?.value.slice(0, startNode.index) +
          inputChar +
          startBlock?.value.slice(startNode.index),
      };

      const newEndBlock = {
        ...endBlock,
        value:
          endBlock?.value.slice(0, endNode.index) +
          OPTIONS[inputChar] +
          endBlock?.value.slice(endNode.index),
      };

      if (startNode.lineId === endNode.lineId) {
        if (startNode.blockId === endNode.blockId) {
          const newValueWithStart = newStartBlock.value;

          const newValue =
            newValueWithStart.slice(0, endNode.index + 1) +
            OPTIONS[inputChar] +
            newValueWithStart.slice(endNode.index + 1);

          const newBlock = {
            ...startBlock,
            value: newValue,
          };

          const newLine = startLine?.map((item) => {
            if (item.id === startNode.blockId) {
              return newBlock;
            }

            return item;
          });

          addToCtrlZ({
            lineId: startNode.lineId,
            blockId: startNode.blockId,
            value: startBlock.value,
            action: "change",
          });

          handleUpdate(startNode.lineId, newLine);
        } else {
          const newLine = startLine?.map((item) => {
            if (item.id === startNode.blockId) {
              return newStartBlock;
            }

            if (item.id === endNode.blockId) {
              return newEndBlock;
            }

            return item;
          });

          addToCtrlZ({
            // @ts-expect-error - fix later
            linesBetween: [
              {
                id: startNode.lineId as string,
                text: startLine as IText,
              },
            ],
            value: [
              {
                id: startNode.lineId as string,
                // @ts-expect-error - fix later
                text: newLine as IText,
              },
            ],
            action: "change_multi_lines",
          });

          handleUpdate(startNode.lineId, newLine);
        }
      } else {
        const newStartLine = startLine?.map((item) => {
          if (item.id === startNode.blockId) {
            return newStartBlock;
          }

          return item;
        });

        const newEndLine = endLine?.map((item) => {
          if (item.id === endNode.blockId) {
            return newEndBlock;
          }

          return item;
        });

        addToCtrlZ({
          // @ts-expect-error - fix later
          linesBetween: [
            {
              id: startNode.lineId as string,
              text: startLine as IText,
            },
            {
              id: endNode.lineId as string,
              text: endLine as IText,
            },
          ],
          value: [
            {
              id: startNode.lineId as string,
              // @ts-expect-error - fix later
              text: newStartLine as IText,
            },
            {
              id: endNode.lineId as string,
              // @ts-expect-error - fix later
              text: newEndLine as IText,
            },
          ],
          action: "change_multi_lines",
        });

        handleUpdate(startNode.lineId, newStartLine);
        handleUpdate(endNode.lineId, newEndLine);
      }

      info.current = {
        selection: endNode.index + 1,
        blockId: endNode.blockId,
      };

      stateStorage.set(
        `${contextName}_decoration-${endNode.blockId}`,
        new Date()
      );

      e.preventDefault();
      return true;
    },
    [addToCtrlZ, contextName, handleUpdate, info]
  );

  const handleChange = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      // only accept letters, numbers, spaces, special characters and accents
      const allowedChars =
        /^[a-zA-Z0-9\s~`!@#$%^&*()_+={}[\]:;"'<>,.?/\\|-À-ÖØ-öø-ÿ|~]+$/;

      let inputChar = event.key;

      const isAllowed = allowedChars.test(inputChar) && event.key.length === 1;

      const newChar = verifyForAccents(event);

      const avoidAlt = handleAltEvents(event);
      let customPosition = 0;

      if (addCustomChar(event, inputChar)) return;

      if (event.key === "Tab") {
        event.preventDefault();
        inputChar = "    ";
        customPosition = 3;
      } else if (!isAllowed && newChar !== false) {
        inputChar = newChar;
      } else if (!isAllowed) {
        verifySpecialChars(event);
        return;
      }

      const ctrlPressed = event.ctrlKey;

      const avoidCtrl = handleCtrlEvents(event, ctrlPressed);

      if (avoidCtrl || avoidAlt) return;
      event.preventDefault();

      const selection = window.getSelection();

      const numberOfChars = selection.toString().length;

      let lineId = id;

      if (numberOfChars) {
        // get the id of the line of the first selected letter
        lineId = deleteMultipleLetters() ?? id;
      }

      setTimeout(() => {
        const selection = window.getSelection();

        const currText = globalState
          .get(contextName)
          .find(({ id: textId }) => textId === lineId)?.text;

        if (!currText) return;

        if (addSingleDecoration(event.key)) return;

        const isCodeBlock =
          selection.anchorNode.parentElement?.parentElement?.tagName === "CODE";

        const changedBlockId = isCodeBlock
          ? selection.anchorNode.parentElement.parentElement.parentElement.parentElement.getAttribute(
              "data-block-id"
            )
          : selection.anchorNode.parentElement.getAttribute("data-block-id") ??
            // @ts-expect-error - this is a valid attribute
            selection.anchorNode.getAttribute?.("data-block-id") ??
            currText[0]?.id;

        const block = currText.find(({ id }) => id === changedBlockId);

        const baseValue = block?.value?.slice?.() ?? "";

        const cursorPositionValue = dga();

        const newValue =
          baseValue.slice(0, cursorPositionValue) +
          inputChar +
          baseValue.slice(cursorPositionValue);

        let prevVal;

        const newText = currText.map((item) => {
          if (item.id === changedBlockId) {
            prevVal = item.value;
            item.value = newValue;
          }

          return item;
        });

        if (!numberOfChars) {
          addToCtrlZ({
            lineId: lineId,
            blockId: changedBlockId,
            value: prevVal,
            action: "change",
          });
        }

        handleUpdate(lineId, newText);

        info.current = {
          selection: cursorPositionValue + 1 + customPosition,
          blockId: changedBlockId,
        };
      });
    },
    [
      addCustomChar,
      addSingleDecoration,
      addToCtrlZ,
      contextName,
      deleteMultipleLetters,
      handleAltEvents,
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
    if (
      !ref.current ||
      selectionRange.start == null ||
      selectionRange.id !== id
    ) {
      return;
    }

    info.current = {
      selection: 0,
      blockId: "",
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

    setTimeout(() => {
      range.setStart(startBlock, selectionRange.start);
      range.setEnd(endBlock, selectionRange.end);

      selection.removeAllRanges();
      selection.addRange(range);
    });
  }, [id, info, selectionRange]);

  const [showPopup, setShowPopup] = useState(false);

  const [showPopupForced] = useTriggerState({
    name: `force_popup_positions_update-${id}`,
    initial: null,
  });

  useEffect(() => {
    if (showPopupForced) {
      setShowPopup(true);
      globalState.set(`force_popup_positions_update-${id}`, null);
    }
  }, [id, showPopupForced]);

  const [closePopupForced] = useTriggerState({
    name: `close_popup_forced-${id}`,
    initial: null,
  });

  useEffect(() => {
    if (closePopupForced) {
      setShowPopup(false);
      globalState.set(`close_popup_forced-${id}`, null);
    }
  }, [closePopupForced, id]);

  const checkSelection = useCallback(() => {
    setTimeout(() => {
      const selection = window.getSelection();
      const lettersSelected = selection.toString().length;
      const { dataLineId } = getBlockId({});

      const show = lettersSelected > 0;

      if (show && dataLineId === id) {
        stateStorage.set("force_popup_positions_update", new Date());
      }
      setShowPopup(show);
    });
  }, [getBlockId, id]);

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

  const getOptions = useCallback((child: ChildNode) => {
    // returns if has some option: bold, italic, underline, strikethrough, highlight, code

    const options = [];

    // @ts-expect-error it sure does
    const style = child?.getAttribute?.("style")?.replace(" ", "") || "";

    const possibleOptions = {
      bold: "bold",
      italic: "italic",
      underline: "underline",
      strikethrough: "strikethrough",
      monospace: "code",
      "font-weight:700;": "bold",
    };

    const possibleTags = {
      STRONG: "bold",
      EM: "italic",
      U: "underline",
      S: "strikethrough",
      CODE: "code",
    };

    Object.entries(possibleOptions).forEach(([key, value]) => {
      if (style.includes(key)) {
        options.push(value);
      }
    });

    Object.entries(possibleTags).forEach(([key, value]) => {
      if (child.nodeName === key) {
        options.push(value);
      }
    });

    return options;
  }, []);

  const findChildOptions = useCallback(
    (child: ChildNode, prevOptions = [], prevChild = []) => {
      const children = Array.from(child.childNodes);

      prevOptions.push(...getOptions(child));

      const allChildrenAreDivOrP = children.every(
        (item) =>
          item.nodeName === "P" ||
          item.nodeName === "DIV" ||
          item.nodeName === "BR"
      );

      if (prevOptions.includes("code") && !allChildrenAreDivOrP) {
        prevChild.push({
          options: [...new Set(prevOptions)],
          value: child.textContent ?? "",
          id: uuid(),
        });
      } else {
        children.forEach((item) => {
          const options = [...prevOptions, ...getOptions(item)];
          // without duplicates
          if (item.nodeName === "#text") {
            prevChild.push({
              options: [...new Set(options)],
              value: item.textContent ?? "",
              id: uuid(),
            });

            return;
          }

          const hasChildren = item.childNodes.length > 0;
          const isCode = item.nodeName === "CODE";

          if (isCode) {
            options.push("code");
            prevChild.push({
              options: [...new Set(options)],
              value: item.textContent ?? "",
              id: uuid(),
            });
          } else if (hasChildren) {
            findChildOptions(item, options, prevChild);
          }
        });
      }

      return prevChild;
    },
    [getOptions]
  );

  const { pasteBlocks } = usePasteBlocks();

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLDivElement>) => {
      e.preventDefault();
      const selection = window.getSelection();

      const numberOfChars = selection.toString().length;
      let lineId = id;

      if (numberOfChars) {
        lineId = deleteMultipleLetters() ?? id;
      }

      const copiedText = e.clipboardData.getData("text/html");
      const items = e.clipboardData.items;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          const file = items[i].getAsFile();
          const reader = new FileReader();

          reader.onload = function () {
            const base64String = reader.result?.toString().split(",")[1];
            handleAddImg(base64String, lineId);
          };

          reader.readAsDataURL(file);
        }
      }

      // transforms the copiedText into html
      const parser = new DOMParser();
      const doc = parser.parseFromString(copiedText, "text/html");

      // if the copied text is not html, it will be plain text
      const isPlainText = doc.body.innerHTML === "";
      if (isPlainText) {
        // if has numberOfChars, it already deleted the letters
        if (!numberOfChars) {
          addToCtrlZ({
            lineId: id,
            value: structuredClone(text),
            action: "delete_letters",
          });
        }

        const plainText = e.clipboardData.getData("text/plain");

        const { changedBlockId, currSelection } = getBlockId({ textId: id });

        const currText = globalState
          .get(contextName)
          .find(({ id: textId }) => textId === lineId)?.text;

        if (!currText) return;

        const block = currText.find(({ id }) => id === changedBlockId);

        const baseValue = block?.value?.slice?.() ?? "";

        const newValue =
          baseValue.slice(0, currSelection) +
          plainText +
          baseValue.slice(currSelection);

        const newContent = currText.map((item) => {
          if (item.id === changedBlockId) {
            item.value = newValue;
          }

          return item;
        });

        handleUpdate(lineId, newContent);

        info.current = {
          selection: currSelection + plainText.length,
          blockId: changedBlockId,
        };

        stateStorage.set(
          `${contextName}_decoration-${changedBlockId}`,
          new Date()
        );
        return;
      }

      // avoids selecting multiple families, that is do not copies son and father
      let children: ChildNode[] = Array.from(
        doc.body.querySelectorAll(
          "p, div, h1, h2, p~span, div~span, h1~span, h2~span, p~a, div~a, h1~a, h2~a, ul, ol"
        )
      );

      children = children.filter((item: HTMLElement) => {
        const parent = item.parentElement;

        // if doesn't have a parent, it's a valid child
        if (!parent) return true;

        // is a list if is close to a ul or ol tag
        const isList = !!item.closest("li");

        const parentIsNotAlreadyAChildren =
          !children.includes(parent) && !isList;

        return parentIsNotAlreadyAChildren;
      });

      // if all the children are only one div and has some class with monospace, it's a code block
      const oneChildrenAndIsCode =
        children.length === 1 && getOptions(children[0]).includes("code");

      // it's only one line if none of the children is a P or DIV tag
      const isOnlyOneLine =
        doc.body.querySelector("p, div, h1, h2, h3, ul, ol") === null;

      if (isOnlyOneLine) {
        children = Array.from(doc.body.childNodes);

        // if has numberOfChars, it already deleted the letters
        if (!numberOfChars) {
          addToCtrlZ({
            lineId: id,
            value: structuredClone(text),
            action: "delete_letters",
          });
        }
      }

      const newText = pasteBlocks({
        isOnlyOneLine,
        oneChildrenAndIsCode,
        children,
      });

      const { changedBlockId, currSelection } = getBlockId({ textId: lineId });

      // gets the current line and the current block, adding the new text after the cursor
      if (isOnlyOneLine) {
        const currText: ILinesBetween["text"] = globalState
          .get(contextName)
          .find(({ id: textId }) => textId === lineId)?.text;

        if (!currText) return;

        const block = currText.find(({ id }) => id === changedBlockId);

        // if needed, splices the block in three
        const baseValue = block?.value?.slice?.() ?? "";

        const spliced1 = baseValue.slice(0, currSelection);
        const spliced2 = baseValue.slice(currSelection);

        let foundTheBlock = false;

        let newContent = currText.reduce<IText[]>((acc, item) => {
          if (item.id === changedBlockId) {
            foundTheBlock = true;
            acc.push({
              value: spliced1,
              id: item.id,
              options: item.options,
            });

            newText.forEach((item) => {
              // @ts-expect-error - only IText falls here
              acc.push(item);
            });

            acc.push({
              value: spliced2,
              id: uuid(),
              options: item.options,
            });
          } else {
            acc.push(item);
          }

          return acc;
        }, []);

        if (!foundTheBlock) {
          // @ts-expect-error - only IText falls here
          newContent = newText;
        }

        globalState.set("arrow_move", true);

        handleUpdate(lineId, newContent);

        const lastNewBlock = newText[newText.length - 1];

        info.current = {
          // @ts-expect-error - only IText falls here
          selection: (lastNewBlock?.value ?? "").length,
          blockId: lastNewBlock.id,
        };

        stateStorage.set(
          `${contextName}_decoration-${lastNewBlock.id}`,
          new Date()
        );
      } else {
        // adds the new text after the current line
        const content = globalState.get(contextName);
        let foundTheLine = false;
        let positionThatWasAdded = 0;
        let lineWasEmpty = null as prevLineInfo;

        let newContent = content.reduce((acc, item, index) => {
          if (item.id === id) {
            positionThatWasAdded = index;
            foundTheLine = true;

            // when it's a line with no text, it's feel more natural to add the text in the same line
            // so we avoid keeping the line empty
            if (!(item.text.length === 1 && item.text[0].value.length === 0)) {
              acc.push(item);
            } else {
              lineWasEmpty = item;
            }

            newText.forEach((item) => {
              acc.push(item);
            });
          } else {
            acc.push(item);
          }

          return acc;
        }, []);

        if (!foundTheLine) {
          newContent = newContent.filter(
            (item) => item.text.length >= 1 && item.text[0].value.length > 0
          );

          positionThatWasAdded = newContent.length;
          newContent = [...newContent, ...newText];
        }

        stateStorage.set(contextName, newContent);

        // if a line was empty, it's better to add the text in the same line
        if (lineWasEmpty) {
          addToCtrlZ({
            lineId: id,
            // @ts-expect-error - only ILinesBetween falls here
            linesBetween: structuredClone(newText),
            action: "add_multi_lines",
            position: positionThatWasAdded,
            prevLineInfo: lineWasEmpty,
          });
        } else {
          addToCtrlZ({
            lineId: id,
            // @ts-expect-error - only ILinesBetween falls here
            linesBetween: structuredClone(newText),
            action: "add_multi_lines",
            position: positionThatWasAdded,
          });
        }

        const lastLine = newText[newText.length - 1];
        // @ts-expect-error - only ILinesBetween falls here
        const lastNewBlock = lastLine.text[lastLine.text.length - 1];

        info.current = {
          selection: lastNewBlock?.value?.length ?? 0,
          blockId: lastNewBlock.id,
        };

        stateStorage.set(
          `${contextName}_decoration-${lastNewBlock.id}`,
          new Date()
        );
      }
    },
    [
      addToCtrlZ,
      contextName,
      deleteMultipleLetters,
      getBlockId,
      getOptions,
      handleAddImg,
      handleUpdate,
      id,
      info,
      pasteBlocks,
      text,
    ]
  );

  useEffect(() => {
    if (keyDownEv == null) return;

    handleChange(keyDownEv.e);
    globalState.set(`key_down_ev-${id}`, null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyDownEv]);

  const [blurEv] = useTriggerState({
    name: `blur_ev-${id}`,
    initial: null,
  });

  useEffect(() => {
    if (blurEv == null) return;

    checkSelection();
    globalState.set(`blur_ev-${id}`, null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blurEv]);

  const [dragEv] = useTriggerState({
    name: `drag_ev-${id}`,
    initial: null,
  });

  useEffect(() => {
    if (dragEv == null) return;

    preventDefault(dragEv.e);
    globalState.set(`drag_ev-${id}`, null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dragEv]);

  const [selectEv] = useTriggerState({
    name: `select_ev-${id}`,
    initial: null,
  });

  useEffect(() => {
    if (selectEv == null) return;

    handleSelect(selectEv.e);
    globalState.set(`select_ev-${id}`, null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectEv]);

  const [pasteEv] = useTriggerState({
    name: `paste_ev-${id}`,
    initial: null,
  });

  useEffect(() => {
    if (pasteEv == null) return;

    handlePaste(pasteEv.e);
    globalState.set(`paste_ev-${id}`, null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pasteEv]);

  const { customProps, customComp } = useCustomComps({
    type,
    id,
    customStyle,
    align,
  });

  const DisEditable = Editable[type ?? "p"];

  if (customStyle && "src" in customStyle) {
    return <Image id={id} customStyle={customStyle} />;
  }

  return (
    <DisEditable
      ref={ref}
      contentEditable
      data-line-id={id}
      data-scribere
      onDrop={(e) => e.preventDefault()}
      suppressContentEditableWarning
      {...customProps}
    >
      {customComp}

      {text.map((item, index) => {
        return (
          <Decoration
            {...{ ...item, info, onlyOneBlockAndIsEmpty }}
            parentText={text}
            key={index}
          />
        );
      })}

      {showPopup && hasFocusId && (
        <Popup
          ref={popupRef}
          align={align}
          type={type}
          id={id}
          text={text}
          parentRef={ref}
        />
      )}
    </DisEditable>
  );
}

export default Component;

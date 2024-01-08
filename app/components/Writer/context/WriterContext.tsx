"use client";

import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import {
  globalState,
  stateStorage,
  useTriggerState,
} from "react-trigger-state";
import { dcs } from "../../../utils/dcs";
import { dga } from "../../../utils/dga";
import uuid from "../../../utils/uuid";
import { useIsAShortcut } from "../hooks/crud/useShortcuts";
import useGetCurrBlockId from "../hooks/useGetCurrBlockId";
import useResize from "../hooks/useResize";
import Image from "../image/image";
import {
  IText,
  IWriterContext,
  IWriterInfo,
  IWritterContent,
} from "../interface";
import Component from "../options/Component/Component";
import { ReadWrite, Selector } from "../options/Component/style";
import { StyledWriter } from "../style";
import Toc from "../tocs/TableOfContents";

export const WriterContext = createContext<IWriterContext>({
  content: [],
  setContent: () => [{ text: "Initial" }],
  handleUpdate: (textId, text) => {
    console.log(textId, text);
  },
  deleteBlock: (textId, blockId) => {
    console.log(textId, blockId);
  },
  deleteLine: (textId) => {
    console.log(textId);
  },
  addToCtrlZ: ({ lineId, blockId, value, action }) => {
    console.log(lineId, blockId, value, action);
  },
  handleAddImg: (img) => {
    console.log(img);
  },
  contextName: "writter_context",
  info: {
    current: {
      selection: 0,
      blockId: "",
    },
  },
});

export const useWriterContext = () => React.useContext(WriterContext);

const WriterContextProvider = ({
  initialContent,
  name,
}: {
  initialContent: IWritterContent[];
  name: string;
}) => {
  // const [content, setContent] = useTriggerState<IWritterContent[]>(initialContent);
  const [content, setContent] = useTriggerState({
    name: `${name}_writter_context`,
    initial: initialContent,
  });

  useEffect(() => {
    setContent(initialContent);
  }, [initialContent, setContent]);

  const contextName = useMemo(() => `${name}_writter_context`, [name]);

  const info = useRef<IWriterInfo>({
    selection: 0,
    blockId: "",
  });

  const handleUpdate = useCallback(
    (textId: string, text: IText[]) => {
      setContent((prev) => {
        const newContent = [...prev];

        const blocks = newContent.find(({ id }) => id === textId);

        blocks.text = text;

        return newContent;
      });
    },
    [setContent]
  );

  const deleteBlock = useCallback(
    (textId: string, blockId: string) => {
      setContent((prev) => {
        const newContent = [...prev];

        const blocks = newContent.find(({ id }) => id === textId);

        const blockDeleted = blocks.text.filter(
          ({ id: blockIdItem }) => blockIdItem !== blockId
        );

        blocks.text = blockDeleted;

        return newContent.map((item) => {
          if (item.id === textId) {
            item.text = blockDeleted;
          }

          return item;
        });
      });
    },
    [setContent]
  );

  const deleteLine = useCallback(
    (textId: string) => {
      setContent((prev) => {
        const newContent = [...prev];

        // if there is only one, keeps the line, but with one block
        if (newContent.length === 1) {
          const blocks = newContent.find(({ id }) => id === textId);

          blocks.text = [{ id: uuid(), value: "", options: [] }];

          info.current = {
            selection: 0,
            blockId: blocks.text[0].id,
          };

          return [blocks];
        }

        const blocks = newContent.filter(({ id }) => id !== textId);

        return blocks;
      });
    },
    [setContent]
  );

  const { getBlockId } = useGetCurrBlockId();

  const undo = useCallback(() => {
    const prevState = globalState.get("undo") || [];

    let lastItem = prevState?.[prevState.length - 1];

    if (!lastItem) return;

    const anchorOffset = dga();

    lastItem = {
      ...lastItem,
      undoAnchorOffset: anchorOffset,
    };
    const prevLineCloned = structuredClone(lastItem.prevLineInfo);

    const iterator = ["add_line", "delete_multi_lines"].includes(
      lastItem.action
    )
      ? "filter"
      : "map";

    const prevent = [
      "delete_line",
      "delete_multi_lines",
      "add_multi_lines",
      "up",
      "down",
      "up_copy",
      "down_copy",
    ].includes(lastItem.action);

    // now find the lineId and blockId of the content
    let updateContent = prevent
      ? content
      : content[iterator]((item) => {
          if (lastItem.action === "change_multi_lines") {
            const lineText = lastItem.linesBetween.find(
              ({ id }) => id === item.id
            )?.text;

            if (lineText) {
              item.text = lineText;
            }
          } else if (
            lastItem.action === "add_line" &&
            item.id === lastItem.lineId
          ) {
            const extra = lastItem.prevLineInfo
              ? {
                  prevLineInfo: {
                    ...lastItem.prevLineInfo,
                    text: content.find(
                      ({ id }) => id === lastItem.prevLineInfo.id
                    ).text,
                  },
                }
              : {};

            const newUndo = [
              ...(globalState.get("redo") || []),
              {
                ...lastItem,
                action: "add_line",
                value: structuredClone(item.text),
                ...extra,
              },
            ];

            stateStorage.set("redo", newUndo);

            return false;
          }

          if (item.id === lastItem.lineId) {
            const newRedo = [
              ...(globalState.get("redo") || []),
              {
                ...lastItem,
                action: "delete_letters",
                value: structuredClone(item.text),
              },
            ];
            stateStorage.set("redo", newRedo);

            if (lastItem.action === "delete_letters") {
              item.text = lastItem.value;
            } else {
              item.text = item.text.map((block) => {
                if (block.id === lastItem.blockId) {
                  if (lastItem.action === "change") {
                    block.value = lastItem.value;
                  }
                }

                return block;
              });
            }
          }

          return item;
        });

    if (lastItem.action === "change_multi_lines") {
      const newRedo = [...(globalState.get("redo") || []), { ...lastItem }];

      stateStorage.set("redo", newRedo);
    } else if (lastItem.action === "add_line") {
      updateContent = updateContent.map((item) => {
        if (item.id === prevLineCloned?.id) {
          item.text = lastItem.prevLineInfo.text;
        }

        return item;
      });
    } else if (lastItem.action === "delete_multi_lines") {
      updateContent = updateContent.reduce((acc, item) => {
        if (lastItem.lineId === item.id) {
          acc.push(...lastItem.linesBetween);
          return acc;
        }

        acc.push(item);

        return acc;
      }, []);

      // add to the redo
      const newRedo = [...(globalState.get("redo") || []), { ...lastItem }];
      stateStorage.set("redo", newRedo);
    }

    if (["up_copy", "down_copy"].includes(lastItem.action)) {
      updateContent = updateContent.reduce((acc, item) => {
        const isTheCopy = lastItem.prevLineInfo.id === item.id;
        if (!isTheCopy) {
          acc.push(item);
        }

        return acc;
      }, []);

      const newRedo = [...(globalState.get("redo") || []), { ...lastItem }];
      stateStorage.set("redo", newRedo);

      setContent([...updateContent]);
    } else if (["up", "down"].includes(lastItem.action)) {
      updateContent = updateContent.reduce((acc, item, index) => {
        const nextWasTheDown =
          lastItem.action === "down" &&
          updateContent[index + 1]?.id === lastItem.lineId;

        if (nextWasTheDown) {
          const regDown = updateContent[index + 1];
          acc.push(regDown);
        }

        if (item.id !== lastItem.lineId) {
          acc.push(item);
        }

        const prevWasTheUp =
          index &&
          lastItem.action === "up" &&
          updateContent[index - 1]?.id === lastItem.lineId;

        if (prevWasTheUp) {
          const regUp = updateContent[index - 1];
          acc.push(regUp);
        }

        return acc;
      }, []);

      const newRedo = [...(globalState.get("redo") || []), { ...lastItem }];
      stateStorage.set("redo", newRedo);

      setContent([...updateContent]);
    } else if (lastItem.action === "add_multi_lines") {
      updateContent = updateContent.reduce((acc, item, index) => {
        const hasId = lastItem.linesBetween?.find?.(({ id }) => id === item.id);

        if (index === lastItem.position && lastItem.deletedLines) {
          acc.push(...lastItem.deletedLines);
        }

        if (!hasId) {
          acc.push(item);
        }

        if (index === lastItem.position && lastItem.prevLineInfo) {
          acc.push(lastItem.prevLineInfo);
        }

        return acc;
      }, []);

      const newRedo = [...(globalState.get("redo") || []), { ...lastItem }];
      stateStorage.set("redo", newRedo);
      setContent([...updateContent]);
    } else if (lastItem.action === "delete_line") {
      updateContent.splice(lastItem.position - 1, 0, lastItem.prevLineInfo);
      const newRedo = [...(globalState.get("redo") || []), { ...lastItem }];
      stateStorage.set("redo", newRedo);
      setContent([...updateContent]);
    } else {
      setContent(updateContent);
    }

    info.current = {
      selection: lastItem.anchorOffset,
      blockId: lastItem.changedBlockId,
    };
    globalState.set("first_selection", null);

    stateStorage.set(
      `${contextName}_decoration-${lastItem.changedBlockId}`,
      new Date()
    );

    // remove the last item, and add it to redo
    stateStorage.set("undo", prevState.slice(0, prevState.length - 1));
  }, [content, contextName, setContent]);

  const redo = useCallback(() => {
    const prevState = globalState.get("redo") || [];

    const lastItem = prevState?.[prevState.length - 1];

    if (!lastItem) return;

    const preventMap = [
      "add_line",
      "down",
      "up",
      "down_copy",
      "up_copy",
    ].includes(lastItem.action);

    const iterator = ["delete_line", "delete_multi_lines"].includes(
      lastItem.action
    )
      ? "filter"
      : "map";

    if (preventMap && lastItem.action === "add_line") {
      globalState.set("add_line_undo", {
        text: content.find(({ id }) => id === lastItem.prevLineInfo.id).text,
      });
    }

    // now find the lineId and blockId of the content
    let updateContent = preventMap
      ? content
      : content[iterator]((item) => {
          if (lastItem.action === "change_multi_lines") {
            const lineText = lastItem.value.find(({ id }) => id === item.id)
              ?.text;

            if (lineText) {
              item.text = lineText;
            }
          } else if (
            lastItem.action === "delete_line" &&
            item.id === lastItem.lineId
          ) {
            const newUndo = [
              ...(globalState.get("undo") || []),
              {
                ...lastItem,
                action: "delete_line",
                value: structuredClone(item.text),
              },
            ];

            stateStorage.set("undo", newUndo);

            return false;
          }

          const isBtw = lastItem.linesBetween?.find?.(
            ({ id }) => id === item.id
          );

          if (lastItem.action === "delete_multi_lines" && isBtw) {
            // only the first line will not be deleted
            const isFirst = lastItem.linesBetween[0].id === item.id;
            return isFirst;
          }

          if (item.id === lastItem.prevLineInfo?.id) {
            item.text = lastItem.prevLineInfo.text;
          } else if (
            item.id === lastItem.lineId &&
            lastItem.action !== "add_line"
          ) {
            const newUndo = [
              ...(globalState.get("undo") || []),
              { ...lastItem, value: structuredClone(item.text) },
            ];
            stateStorage.set("undo", newUndo);

            if (lastItem.action === "delete_letters") {
              item.text = lastItem.value;
              return item;
            }

            item.text = item.text.map((block) => {
              if (block.id === lastItem.blockId) {
                if (lastItem.action === "change") {
                  block.value = lastItem.value;
                }
              }

              return block;
            });
          }

          return item;
        });

    if (lastItem.action === "change_multi_lines") {
      const newUndo = [...(globalState.get("undo") || []), { ...lastItem }];

      stateStorage.set("undo", newUndo);
    }

    if (["up_copy", "down_copy"].includes(lastItem.action)) {
      updateContent = updateContent.reduce((acc, item) => {
        const isTheCopy = lastItem.lineId === item.id;

        if (isTheCopy && lastItem.action === "up_copy") {
          acc.push(lastItem.prevLineInfo);
        }

        acc.push(item);

        if (isTheCopy && lastItem.action === "down_copy") {
          acc.push(lastItem.prevLineInfo);
        }

        return acc;
      }, []);

      const newUndo = [...(globalState.get("undo") || []), lastItem];
      stateStorage.set("undo", newUndo);

      setContent([...updateContent]);
    } else if (["up", "down"].includes(lastItem.action)) {
      updateContent = updateContent.reduce((acc, item, index) => {
        const nextWasTheDown =
          lastItem.action === "up" &&
          updateContent[index + 1]?.id === lastItem.lineId;

        if (nextWasTheDown) {
          const regDown = updateContent[index + 1];
          acc.push(regDown);
        }

        if (item.id !== lastItem.lineId) {
          acc.push(item);
        }

        const prevWasTheUp =
          index &&
          lastItem.action === "down" &&
          updateContent[index - 1]?.id === lastItem.lineId;

        if (prevWasTheUp) {
          const regUp = updateContent[index - 1];
          acc.push(regUp);
        }

        return acc;
      }, []);
      // add to the redo
      setContent([...updateContent]);

      const newUndo = [...(globalState.get("undo") || []), lastItem];

      stateStorage.set("undo", newUndo);
    } else if (lastItem.action === "add_line") {
      updateContent.splice(lastItem.position + 1, 0, {
        id: lastItem.lineId,
        text: lastItem.value,
      });

      const extra = lastItem.prevLineInfo
        ? {
            prevLineInfo: {
              id: lastItem.prevLineInfo?.id,
              text: globalState.get("add_line_undo").text,
            },
          }
        : {};

      const newUndo = [
        ...(globalState.get("undo") || []),
        {
          ...lastItem,
          ...extra,
        },
      ];

      stateStorage.set("undo", newUndo);
      setContent([...updateContent]);
    } else if (lastItem.action === "add_multi_lines") {
      updateContent = updateContent.reduce((acc, item, position) => {
        const isInPosition = position === lastItem.position;

        // if has the prevLineInfo, it will add it to the undo
        if (!(isInPosition && lastItem.prevLineInfo)) {
          acc.push(item);
        }

        if (isInPosition) {
          acc.push(...lastItem.linesBetween);
        }

        return acc;
      }, []);

      const newUndo = [...(globalState.get("undo") || []), lastItem];

      stateStorage.set("undo", newUndo);

      setContent([...updateContent]);
    } else if (lastItem.action === "delete_multi_lines") {
      // add to the redo
      const newUndo = [
        ...(globalState.get("undo") || []),
        structuredClone(lastItem),
      ];

      stateStorage.set("undo", newUndo);

      updateContent = updateContent.map((item) => {
        if (lastItem.lineId === item.id) {
          item.text = lastItem.value;
        }

        return item;
      });

      setContent([...updateContent]);
    } else {
      setContent(updateContent);
    }

    info.current = {
      selection: lastItem.undoAnchorOffset,
      blockId: lastItem.changedBlockId,
    };
    globalState.set("first_selection", null);

    stateStorage.set(
      `${contextName}_decoration-${lastItem.changedBlockId}`,
      new Date()
    );

    // remove the last item, and add it to redo
    stateStorage.set("redo", prevState.slice(0, prevState.length - 1));
  }, [content, contextName, setContent]);

  const isShortcut = useIsAShortcut();

  const handleKeyDown = useCallback(
    (e) => {
      if (isShortcut(e)) return;

      const { dataLineId, currSelection, changedBlockId } = getBlockId({});
      stateStorage.set(`key_down_ev-${dataLineId}`, { e, date: new Date() });

      if (e.key !== "ArrowRight") return;

      const line = (e.target as HTMLDivElement).querySelector(
        `[data-line-id="${dataLineId}"]`
      );
      const nextLine = line?.nextSibling as HTMLDivElement;
      const isNextATodo = nextLine?.getAttribute("data-component") === "tl";
      const isThisATodo = line?.getAttribute("data-component") === "tl";

      if (!isNextATodo || isThisATodo) return;

      const block = (e.target as HTMLDivElement).querySelector(
        `[data-block-id="${changedBlockId}"]`
      );

      const lastBlockOfLine = line?.lastChild;

      const isLastBlockOfLine = block === lastBlockOfLine;

      if (!isLastBlockOfLine) return;

      if (block?.textContent?.length !== currSelection) return;

      const selection = window.getSelection();

      const range = document.createRange();
      const nextLineBlock = nextLine.querySelector("[data-block-id]");

      range.setStart(nextLineBlock, 0);
      range.setEnd(nextLineBlock, 0);

      selection.removeAllRanges();
      selection.addRange(range);

      e.preventDefault();

      info.current = {
        selection: 0,
        blockId: nextLineBlock.getAttribute("data-block-id"),
      };

      stateStorage.set(
        `${contextName}_decoration-${nextLineBlock.getAttribute(
          "data-block-id"
        )}`,
        new Date()
      );
    },
    [contextName, getBlockId, isShortcut]
  );

  const handleBlur = useCallback(
    (
      e:
        | React.FocusEvent<HTMLDivElement>
        | React.MouseEvent<HTMLDivElement, MouseEvent>,
      isBlur?: boolean
    ) => {
      isBlur = isBlur || true;

      const { dataLineId } = getBlockId({});
      globalState.set("select_all_content", null);

      const prevSelected = globalState.get("prev-selected");
      const selection = window.getSelection().toString().length;
      const selectedClicked = globalState.get("clicked-item");

      if (isBlur && prevSelected && selection === 0 && !selectedClicked) {
        const el = e.target as HTMLElement;
        const isTheSame =
          (el.getAttribute("data-line-id") ||
            el.closest("[data-line-id]")?.getAttribute("data-line-id")) ===
          prevSelected;

        // if the prev selected is not the same as the current, it will remove the focus
        if (!isTheSame) {
          stateStorage.set(`has_focus_ev-${prevSelected}`, false);
        }
      }

      const alreadyHasPopup = document
        .querySelector("[data-popup]")
        ?.getAttribute("data-popup");

      if (alreadyHasPopup && alreadyHasPopup !== dataLineId) {
        return;
      }

      stateStorage.set(`blur_ev-${dataLineId}`, { e, date: new Date() });
    },
    [getBlockId]
  );

  const handleDrag = useCallback(
    (e) => {
      const { dataLineId } = getBlockId({});
      stateStorage.set(`drag_ev-${dataLineId}`, { e, date: new Date() });
    },
    [getBlockId]
  );

  const handleSelect = useCallback(
    (e) => {
      const { dataLineId } = getBlockId({});
      const prevSelected = globalState.get("prev-selected");

      if (e.target.tagName === "INPUT") return;

      if (prevSelected !== dataLineId) {
        stateStorage.set(`has_focus_ev-${prevSelected}`, false);
      }

      const currRange = window.getSelection().toString().length;

      // when selection is empty, no popup is shown
      if (currRange === 0) {
        globalState.set("popup_anchor", null);
      } else {
        // gets all the spans with the empty class
        const spans = document.querySelectorAll("span.empty");

        spans.forEach((span) => {
          // removes the placeholder attribute
          span.removeAttribute("placeholder");
        });
      }

      stateStorage.set(`has_focus_ev-${dataLineId}`, true);

      stateStorage.set(`select_ev-${dataLineId}`, { e, date: new Date() });

      globalState.set("prev-selected", dataLineId);
    },
    [getBlockId]
  );

  const handleContextMenu = useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      e.preventDefault();

      const { dataLineId } = getBlockId({});
      // gets the line
      const line = (e.target as HTMLDivElement).closest("[data-line-id]");
      // selects all the text
      const range = document.createRange();
      range.selectNodeContents(line);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);

      setTimeout(() => {
        stateStorage.set(`has_focus_ev-${dataLineId}`, true);
        stateStorage.set(`select_ev-${dataLineId}`, { e, date: new Date() });
        stateStorage.set("is_context_menu", true);
      });
    },
    [getBlockId]
  );

  const handlePaste = useCallback(
    (e) => {
      if ((e.target as HTMLElement).closest("[data-link]")) {
        return;
      }

      const { dataLineId } = getBlockId({});
      stateStorage.set(`paste_ev-${dataLineId}`, { e, date: new Date() });
    },
    [getBlockId]
  );

  const addToCtrlZ: IWriterContext["addToCtrlZ"] = useCallback(
    (block) => {
      const prevState = globalState.get("undo") || [];
      const { changedBlockId } = getBlockId({});

      const lastItem = prevState?.[prevState.length - 1];

      if (
        ["change"].includes(lastItem?.action) &&
        lastItem?.blockId === block.blockId
      ) {
        const prevWords = lastItem.value?.split(" ");
        // @ts-expect-error works
        const currWords = block.value?.split?.(" ");

        const diff = currWords?.length - prevWords?.length;

        if (!diff && currWords) {
          return;
        }
      }
      const selection = window.getSelection();
      const anchorOffset = dga();

      const blockInfo = {
        ...block,
        selection,
        changedBlockId,
        anchorOffset,
      };

      if (
        lastItem?.action === "delete_letters" &&
        lastItem?.lineId === block.lineId &&
        lastItem?.blockId === block.blockId &&
        typeof block.value !== "string"
      ) {
        const currWords = block?.value
          ?.find(({ id }) => id === block.blockId)
          ?.value?.split(" ");

        const prevWords = lastItem.value
          .find(({ id }) => id === block.blockId)
          ?.value?.split(" ");

        const diff = currWords?.length - prevWords?.length;

        if (!diff && currWords) {
          return;
        }
      }

      if (block.action === "add_multi_lines") {
        // gets the last line from the undo
        const lastLine = prevState[prevState.length - 1];
        if (lastLine?.action === "delete_multi_lines") {
          // remove the last item, and add it to redo
          const newBlock = {
            ...blockInfo,
            deletedLines: lastLine.linesBetween,
          };

          stateStorage.set("undo", [
            ...prevState.slice(0, prevState.length - 1),
            newBlock,
          ]);
          return;
        }
      }
      stateStorage.set("undo", [...prevState, blockInfo]);
    },
    [getBlockId]
  );

  // if triple click, it will select the whole line
  const handleClick = useCallback(() => {
    const startedCount = globalState.get("started-count");
    const { dataLineId } = getBlockId({});
    const lineCount = globalState.get("line-count");

    if (
      !startedCount ||
      lineCount !== dataLineId ||
      new Date().getTime() - startedCount?.getTime() > 500
    ) {
      globalState.set("started-count", new Date());
      globalState.set("triple-count", 1);
      globalState.set("line-count", dataLineId);
      return;
    }

    const count = globalState.get("triple-count") || 0;

    if (count >= 2) {
      globalState.set("triple-count", 0);
      globalState.set("started-count", null);
      // gets the text from the curr line
      const lineText = globalState
        .get(contextName)
        .find(({ id }) => id === dataLineId)?.text;

      if (!lineText) return;

      const firstTextId = lineText[0].id;
      const lastTextId = lineText[lineText.length - 1].id;
      setTimeout(() => {
        dcs(firstTextId, lastTextId, false);
      });
    } else {
      globalState.set("triple-count", count + 1);
    }
  }, [contextName, getBlockId]);

  useEffect(() => {
    // add listener
    const handleChange = (e) => {
      // if ctrl is pressed and z is pressed, it will undo the last action
      if (e.ctrlKey && e.key.toLocaleLowerCase() === "z") {
        undo();
        return;
      }

      if (e.ctrlKey && e.key.toLocaleLowerCase() === "y") {
        redo();
        return;
      }
    };

    window.addEventListener("keydown", handleChange);

    return () => {
      window.removeEventListener("keydown", handleChange);
    };
  }, [handleKeyDown, redo, undo]);

  useEffect(() => {
    // add listener to windows focus
    const handleFocus = () => {
      globalState.set("clicked-item", true);
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  const writterRef = useRef<HTMLDivElement>(null);

  useResize(writterRef);

  const handleAddImg = useCallback(
    (img, lineId) => {
      setContent((prev) => {
        const newContent = prev.reduce((acc, item) => {
          acc.push(item);

          if (item.id === lineId) {
            const newText: IWritterContent = {
              id: uuid(),
              type: "img",
              customStyle: {
                src: `data:image/png;base64,${img}`,
              },
              text: [],
            };

            acc.push(newText);
          }

          return acc;
        }, []);

        return newContent;
      });
    },
    [setContent]
  );

  const foundRef = useRef(false);

  const addFocus = useCallback(() => {
    const focus = document.querySelector("[data-line-id");

    foundRef.current = !!focus;
    if (focus) {
      const range = document.createRange();
      const child = focus.firstChild?.firstChild;
      stateStorage.set(
        `has_focus_ev-${focus.getAttribute("data-line-id")}`,
        true
      );
      // if has the length, it will add the focus to the first letter
      if (child != null) {
        range.setStart(child, child.textContent.length);
        range.setEnd(child, child.textContent.length);
      } else {
        const block = focus.querySelector("[data-block-id]");

        // it`s empty
        if (!block) {
          range.selectNodeContents(focus.firstChild);
          return;
        }

        range.setStart(block.firstChild || block, block.textContent.length);
        range.setEnd(block.firstChild || block, block.textContent.length);
      }

      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }, []);

  useEffect(() => {
    if (foundRef.current) {
      return;
    }

    addFocus();
    setTimeout(() => {
      addFocus();
    });
  }, [addFocus, content]);

  return (
    <WriterContext.Provider
      value={{
        content,
        setContent,
        handleUpdate,
        handleAddImg,
        contextName,
        deleteBlock,
        deleteLine,
        info,
        addToCtrlZ,
      }}
    >
      <Image />
      <StyledWriter.Wrapper>
        <StyledWriter.Container ref={writterRef}>
          <Selector data-link-selector />

          <Toc />

          <ReadWrite
            contentEditable
            onContextMenu={handleContextMenu}
            onKeyDown={handleKeyDown}
            onBlur={(e: React.FocusEvent<HTMLDivElement>) => {
              const relatedTarget = e.relatedTarget as HTMLElement;

              if (
                relatedTarget?.closest("[data-link]") ||
                e.target.closest("[data-link]")
              ) {
                return;
              }

              globalState.set("clicked-item", false);
              handleBlur(e);
            }}
            onClick={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
              const datas = ["todo"];
              // info.current = {
              //   selection: 0,
              //   blockId: "",
              // };

              const hasSomeData = datas.some((data) =>
                (e.target as Element).hasAttribute(`data-${data}`)
              );

              if ((e.target as HTMLElement).closest("[data-link]")) {
                return;
              }

              if (hasSomeData) {
                // removes all the selection
                window.getSelection().removeAllRanges();
                return;
              }

              handleBlur(e, false);
              globalState.set("clicked-item", true);
              handleClick();
            }}
            onDragStart={handleDrag}
            onDrop={handleDrag}
            onSelectCapture={handleSelect}
            onPaste={handlePaste}
            suppressContentEditableWarning
          >
            {content.map((item, index) => {
              return <Component key={index} {...item} position={index} />;
            })}
          </ReadWrite>
        </StyledWriter.Container>
      </StyledWriter.Wrapper>
    </WriterContext.Provider>
  );
};

export default WriterContextProvider;

export const useContextName = () => {
  const { contextName } = useWriterContext();

  return contextName;
};

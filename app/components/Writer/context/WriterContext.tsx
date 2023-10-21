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
import uuid from "../../../utils/uuid";
import useGetCurrBlockId from "../hooks/useGetCurrBlockId";
import {
  IText,
  IWriterContext,
  IWriterInfo,
  IWritterContent,
} from "../interface";
import Component from "../options/Component/Component";
import { ReadWrite } from "../options/Component/style";
import { dcs } from "../../../utils/dcs";
import { dga } from "../../../utils/dga";

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
    ].includes(lastItem.action);

    // now find the lineId and blockId of the content
    let updateContent = prevent
      ? content
      : content[iterator]((item) => {
          if (lastItem.action === "add_line" && item.id === lastItem.lineId) {
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

    if (lastItem.action === "add_line") {
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

    if (lastItem.action === "add_multi_lines") {
      updateContent = updateContent.reduce((acc, item, index) => {
        const hasId = lastItem.linesBetween?.find?.(({ id }) => id === item.id);

        if (index === lastItem.position && lastItem.deletedLines) {
          acc.push(...lastItem.deletedLines);
        }

        if (!hasId) {
          acc.push(item);
        }

        return acc;
      }, []);

      const newRedo = [...(globalState.get("redo") || []), { ...lastItem }];
      stateStorage.set("redo", newRedo);
      setContent([...updateContent]);
    } else if (lastItem.action === "delete_line") {
      updateContent.splice(lastItem.position - 1, 0, {
        id: lastItem.lineId,
        text: lastItem.value,
      });
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

    const preventMap = lastItem.action === "add_line";
    const iterator = ["delete_line", "delete_multi_lines"].includes(
      lastItem.action
    )
      ? "filter"
      : "map";

    if (preventMap && lastItem.prevLineInfo) {
      globalState.set("add_line_undo", {
        text: content.find(({ id }) => id === lastItem.prevLineInfo.id).text,
      });
    }

    // now find the lineId and blockId of the content
    let updateContent = content[iterator]((item) => {
      if (lastItem.action === "delete_line" && item.id === lastItem.lineId) {
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

      const isBtw = lastItem.linesBetween?.find?.(({ id }) => id === item.id);

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

    if (preventMap) {
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
        acc.push(item);

        if (isInPosition) {
          acc.push(...lastItem.linesBetween);
        }

        return acc;
      }, []);

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

  const handleKeyDown = useCallback(
    (e) => {
      const { dataLineId } = getBlockId({});
      stateStorage.set(`key_down_ev-${dataLineId}`, { e, date: new Date() });
    },
    [getBlockId]
  );

  const handleBlur = useCallback(
    (e) => {
      const { dataLineId } = getBlockId({});

      const prevSelected = globalState.get("prev-selected");
      const selection = window.getSelection().toString().length;
      const selectedClicked = globalState.get("clicked-item");

      if (prevSelected && selection === 0 && !selectedClicked) {
        stateStorage.set(`has_focus_ev-${prevSelected}`, false);
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

  const handlePaste = useCallback(
    (e) => {
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
        const currWords = block.value
          .find(({ id }) => id === block.blockId)
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
        .find(({ id }) => id === dataLineId).text;

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
      if (e.ctrlKey && e.key === "z") {
        undo();
        return;
      }

      if (e.ctrlKey && e.key === "y") {
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

  return (
    <WriterContext.Provider
      value={{
        content,
        setContent,
        handleUpdate,
        contextName,
        deleteBlock,
        deleteLine,
        info,
        addToCtrlZ,
      }}
    >
      <ReadWrite
        contentEditable
        onKeyDown={handleKeyDown}
        onBlur={(e) => {
          globalState.set("clicked-item", false);
          handleBlur(e);
        }}
        onClick={(e) => {
          handleBlur(e);
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
    </WriterContext.Provider>
  );
};

export default WriterContextProvider;

export const useContextName = () => {
  const { contextName } = useWriterContext();

  return contextName;
};

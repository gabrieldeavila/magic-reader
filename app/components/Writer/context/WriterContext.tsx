"use client";

import React, { createContext, useCallback, useMemo, useRef } from "react";
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

    const lastItem = prevState?.[prevState.length - 1];

    if (!lastItem) return;

    const iterator = lastItem.action === "add_line" ? "filter" : "map";
    const prevent = lastItem.action === "delete_line";

    // now find the lineId and blockId of the content
    const updateContent = prevent
      ? content
      : content[iterator]((item) => {
          if (lastItem.action === "add_line" && item.id === lastItem.lineId) {
            const newUndo = [
              ...(globalState.get("redo") || []),
              {
                ...lastItem,
                action: "add_line",
                value: structuredClone(item.text),
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

    if (prevent) {
      updateContent.splice(lastItem.position, 0, {
        id: lastItem.lineId,
        text: lastItem.value,
      });
      const newRedo = [...(globalState.get("redo") || []), { ...lastItem }];
      stateStorage.set("redo", newRedo);
      setContent([...updateContent]);
    } else {
      setContent(updateContent);
    }
    // remove the last item, and add it to redo
    stateStorage.set("undo", prevState.slice(0, prevState.length - 1));
  }, [content, setContent]);

  const redo = useCallback(() => {
    const prevState = globalState.get("redo") || [];

    const lastItem = prevState?.[prevState.length - 1];

    if (!lastItem) return;

    const preventMap = lastItem.action === "add_line";
    const iterator = lastItem.action === "delete_line" ? "filter" : "map";

    // now find the lineId and blockId of the content
    const updateContent = preventMap
      ? content
      : content[iterator]((item) => {
          if (
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

          if (item.id === lastItem.lineId) {
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
      updateContent.splice(lastItem.position, 0, {
        id: lastItem.lineId,
        text: lastItem.value,
      });
      const newUndo = [...(globalState.get("undo") || []), { ...lastItem }];
      stateStorage.set("undo", newUndo);
      setContent([...updateContent]);
    } else {
      setContent(updateContent);
    }
    // remove the last item, and add it to redo
    stateStorage.set("redo", prevState.slice(0, prevState.length - 1));
  }, [content, setContent]);

  const handleKeyDown = useCallback(
    (e) => {
      // if ctrl is pressed and z is pressed, it will undo the last action
      if (e.ctrlKey && e.key === "z") {
        undo();
        return;
      }

      if (e.ctrlKey && e.key === "y") {
        redo();
        return;
      }

      const { dataLineId } = getBlockId({});
      stateStorage.set(`key_down_ev-${dataLineId}`, { e, date: new Date() });
    },
    [getBlockId, redo, undo]
  );

  const handleBlur = useCallback(
    (e) => {
      const { dataLineId } = getBlockId({});
      const prevSelected = globalState.get("prev-selected");
      const selection = window.getSelection().toString().length;

      if (prevSelected && selection === 0) {
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

  const addToCtrlZ: IWriterContext["addToCtrlZ"] = useCallback((block) => {
    const prevState = globalState.get("undo") || [];
    stateStorage.set("undo", [...prevState, block]);
  }, []);

  console.log(content);

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
        onBlur={handleBlur}
        onFocus={handleBlur}
        onClick={handleBlur}
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

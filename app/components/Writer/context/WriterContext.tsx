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
  handleUpdate: (textId: string, text: IText[]) => {
    console.log(textId, text);
  },
  deleteBlock: (textId: string, blockId: string) => {
    console.log(textId, blockId);
  },
  deleteLine: (textId: string) => {
    console.log(textId);
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

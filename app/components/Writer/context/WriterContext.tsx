"use client";

import React, { createContext, useCallback, useMemo } from "react";
import { useTriggerState } from "react-trigger-state";
import { IText, IWriterContext, IWritterContent } from "../interface";
import Component from "../options/Component/Component";

export const WriterContext = createContext<IWriterContext>({
  content: [],
  setContent: () => [{ text: "Initial" }],
  handleUpdate: (textId: number, text: IText[]) => {
    console.log(textId, text);
  },
  deleteBlock: (textId: number, blockId: number) => {
    console.log(textId, blockId);
  },
  contextName: "writter_context",
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

  const handleUpdate = useCallback(
    (textId: number, text: IText[]) => {
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
    (textId: number, blockId: number) => {
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

  return (
    <WriterContext.Provider
      value={{ content, setContent, handleUpdate, contextName, deleteBlock }}
    >
      <h1>oi</h1>
      {content.map((item, index) => {
        return <Component key={index} {...item} position={index} />;
      })}
    </WriterContext.Provider>
  );
};

export default WriterContextProvider;

export const useContextName = () => {
  const { contextName } = useWriterContext();

  return contextName;
};

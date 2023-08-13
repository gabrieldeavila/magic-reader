"use client";

import React, { createContext, useCallback, useMemo } from "react";
import { useTriggerState } from "react-trigger-state";
import { IText, IWriterContext, IWritterContent } from "../interface";
import Component from "../options/Component/Component";

export const WriterContext = createContext<IWriterContext>({
  content: [],
  setContent: () => [{ text: "Initial" }],
  handleUpdate: (position: number, text: IText[]) => {
    console.log(position, text);
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
    (position: number, text: IText[]) => {
      setContent((prev) => {
        const newContent = [...prev];

        newContent[position].text = text;
        return newContent;
      });
    },
    [setContent]
  );

  return (
    <WriterContext.Provider
      value={{ content, setContent, handleUpdate, contextName }}
    >
      {content.map((item, index) => {
        return <Component key={index} {...item} position={index} />;
      })}
    </WriterContext.Provider>
  );
};

export default WriterContextProvider;

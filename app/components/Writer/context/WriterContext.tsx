"use client";

import React, { createContext, useCallback, useState } from "react";
import { IText, IWriterContext, IWritterContent } from "../interface";
import Component from "../options/Component/Component";

export const WriterContext = createContext<IWriterContext>({
  content: [],
  setContent: () => [{ text: "Initial" }],
  handleUpdate: (position: number, text: IText) => {
    console.log(position, text);
  },
});

export const useWriterContext = () => React.useContext(WriterContext);

const WriterContextProvider = ({
  initialContent,
}: {
  initialContent: IWritterContent[];
}) => {
  const [content, setContent] = useState<IWritterContent[]>(initialContent);

  const handleUpdate = useCallback((position: number, text: IText) => {
    setContent((prev) => {
      const newContent = [...prev];
      // newContent[position].text = text;
      return newContent;
    });
  }, []);

  return (
    <WriterContext.Provider value={{ content, setContent, handleUpdate }}>
      {content.map((item, index) => {
        return <Component key={index} {...item} position={index} />;
      })}
    </WriterContext.Provider>
  );
};

export default WriterContextProvider;

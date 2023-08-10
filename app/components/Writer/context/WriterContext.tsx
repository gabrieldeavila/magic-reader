"use client";

import React, { createContext, useCallback, useState } from "react";
import { IWriterContext, IWritterContent } from "../interface";
import Component from "../options/Component/Component";

export const WriterContext = createContext<IWriterContext>({
  content: [],
  setContent: () => [{ text: "Initial" }],
  handleUpdate: () => {},
});

export const useWriterContext = () => React.useContext(WriterContext);

const OPTIONS = {
  p: React.lazy(() => import("../options/Component/Component")),
};

const WriterContextProvider = ({ initialContent }) => {
  const [content, setContent] = useState<IWritterContent[]>(initialContent);

  const handleUpdate = useCallback((position, text) => {
    setContent((prev) => {
      const newContent = [...prev];
      newContent[position].text = text;
      return newContent;
    });
  }, []);

  return (
    <WriterContext.Provider value={{ content, setContent, handleUpdate }}>
      {content.map((item, index) => {
        return <Component {...item} position={index} />;
      })}
    </WriterContext.Provider>
  );
};

export default WriterContextProvider;

"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Phrase from "./Phrase";
import { GTTooltip, Space, Text, useGTTranslate } from "@geavila/gt-design";
import { TextArea } from "./styles";

function Example() {
  const { translateThis } = useGTTranslate();

  const [textArea] = useState(
    translateThis("LEGERE.EXAMPLE_PARAGRAPH")
  );

  const [textAreaNew, setTextAreaNew] = useState(
    translateThis("LEGERE.EXAMPLE_PARAGRAPH")
  );

  const lines = useMemo(() => {
    return textAreaNew.split("\n") || [];
  }, [textAreaNew]);

  const [width, setWidth] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth / 1.75;
      setWidth(width);
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleChangeDiv = useCallback((e) => {
    setTextAreaNew(e.target.innerText);
  }, []);

  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <Space.Modifiers gridGap="1rem" flexWrap="wrap" justifyContent="center">
      <Space.Modifiers
        gridGap="0.5rem"
        flexDirection="column"
        alignItems="center"
      >
        <Text.H2>{translateThis("LEGERE.DEFAULT")}</Text.H2>
        <TextArea style={{ width }} onKeyUp={handleChangeDiv} contentEditable>
          {textArea}
        </TextArea>
      </Space.Modifiers>
      <Space.Modifiers
        gridGap="0.5rem"
        flexDirection="column"
        alignItems="center"
        position="relative"
        ref={containerRef}
      >
        <Text.H2>{translateThis("LEGERE.NOW")}</Text.H2>
        <TextArea
          style={{
            background: "var(--containerSecondary)",
          }}
        >
          {lines.map((line, index) => (
            <Phrase
              customWidth={"-webkit-fill-available"}
              key={index}
              index={index}
              phrase={line}
            />
          ))}
        </TextArea>
        <GTTooltip
          parentRef={containerRef}
          title="LANDING_PAGE.EXAMPLE.TITLE"
          text="LANDING_PAGE.EXAMPLE.DESCRIPTION"
        />
      </Space.Modifiers>
    </Space.Modifiers>
  );
}

export default Example;

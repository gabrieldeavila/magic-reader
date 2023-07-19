"use client";

import React, { useEffect, useMemo, useState } from "react";
import Phrase from "./Phrase";
import { Space, Text, useGTTranslate } from "@geavila/gt-design";
import { TextArea } from "./styles";

function Example() {
  const { translateThis } = useGTTranslate();

  const [textArea, setTextArea] = useState(
    translateThis("LEGERE.EXAMPLE_PARAGRAPH")
  );

  const lines = useMemo(() => {
    return textArea.split("\n") || [];
  }, [textArea]);

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

  return (
    // @ts-expect-error
    <Space.Modifiers gridGap="1rem" flexWrap="wrap" justifyContent="center">
      {/* @ts-expect-error */}
      <Space.Modifiers flexDirection="column" alignItems="center">
        <Text.H2>{translateThis("LEGERE.DEFAULT")}</Text.H2>
        <TextArea
          style={{ width }}
          value={textArea}
          onChange={(e) => setTextArea(e.target.value)}
        />
      </Space.Modifiers>
      {/* @ts-expect-error */}
      <Space.Modifiers flexDirection="column" alignItems="center">
        <Text.H2>{translateThis("LEGERE.NOW")}</Text.H2>
        {lines.map((line, index) => (
          <Phrase customWidth={500} key={index} index={index} phrase={line} />
        ))}
      </Space.Modifiers>
    </Space.Modifiers>
  );
}

export default Example;

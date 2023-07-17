"use client";

import React, { useMemo, useState } from "react";
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

  return (
    // @ts-expect-error
    <Space.Modifiers gridGap="1rem" flexWrap="wrap" justifyContent="center">
      {/* @ts-expect-error */}
      <Space.Modifiers flexDirection="column" alignItems="center">
        <Text.H2>{translateThis("LEGERE.DEFAULT")}</Text.H2>
        <TextArea
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

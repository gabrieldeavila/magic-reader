import { useMemo } from "react";
import Word from "./Word";
import { Space } from "@geavila/gt-design";

function Phrase({ phrase, index }: { phrase: string, index: number }) {
  const words = useMemo(() => phrase.split(" "), [phrase]);

  if (phrase === "" && !index) return null;

  return (
    <Space.Modifiers
      minHeight="1.5rem"
      alignItems="center"
      gridGap="0.5rem"
      width="100%"
    >
      {words.map((word, index) => (
        <Word key={index} word={word} />
      ))}
    </Space.Modifiers>
  );
}

export default Phrase;

import { useEffect, useMemo, useState } from "react";
import Word from "./Word";
import { Space } from "@geavila/gt-design";

function Phrase({ phrase, index }: { phrase: string; index: number }) {
  const words = useMemo(() => phrase.split(" "), [phrase]);

  const [width, setWidth] = useState(window.innerWidth / 1.75);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth / 1.75;
      setWidth(width);
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (phrase === "" && !index) return null;

  return (
    <Space.Modifiers
      minHeight="fit-content"
      alignItems="center"
      gridGap="0 0.5rem"
      width={width}
      flexWrap="wrap"
    >
      {words.map((word, index) => (
        <Word key={index} word={word} />
      ))}
    </Space.Modifiers>
  );
}

export default Phrase;

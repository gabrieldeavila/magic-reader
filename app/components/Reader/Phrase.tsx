import { useEffect, useMemo, useState } from "react";
import Word from "./Word";
import { Space } from "@geavila/gt-design";

const GET_INITIAL_WIDTH = (customWidth?: number | string) => {
  if (customWidth) return customWidth;

  try {
    return window.innerWidth / 1.75;
  } catch {
    return 0;
  }
};

function Phrase({
  phrase,
  index,
  customWidth,
}: {
  phrase: string;
  index: number;
  customWidth?: number | string;
}) {
  const words = useMemo(() => phrase.split(" "), [phrase]);

  const [width, setWidth] = useState(GET_INITIAL_WIDTH(customWidth));

  useEffect(() => {
    const handleResize = () => {
      if (customWidth) return;

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
      // @ts-expect-error
      minHeight="fit-content"
      alignItems="center"
      gridGap="0 0.5rem"
      width={width}
      maxWidth="500px"
      flexWrap="wrap"
    >
      {words.map((word, index) => (
        <Word key={index} word={word} />
      ))}
    </Space.Modifiers>
  );
}

export default Phrase;

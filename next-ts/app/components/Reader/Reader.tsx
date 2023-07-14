import { Button, Space } from "@geavila/gt-design";
import { useTriggerState } from "react-trigger-state";
import Phrase from "./Phrase";
import { useCallback, useMemo, useState } from "react";

function Reader() {
  const [readingBook] = useTriggerState({ name: "reading_book", initial: {} });
  const [currPage, setCurrPage] = useState(0);

  const lines = useMemo(() => {
    console.log(readingBook);
    if (!readingBook.pages) return [];

    return readingBook.pages[currPage];
  }, [readingBook, currPage]);

  const handleNext = useCallback(() => {
    if (currPage === readingBook.pages.length - 1) return;

    setCurrPage((prev) => prev + 1);
  }, [currPage]);

  const handlePrev = useCallback(() => {
    if (currPage === 0) return;

    setCurrPage((prev) => prev - 1);
  }, [currPage]);

  return (
    <Space.Modifiers flexWrap="wrap">
      {lines.map((phrase: string, index: number) => (
        <Phrase key={index} index={index} phrase={phrase} />
      ))}
      <Button.Contrast onClick={handleNext}>Next</Button.Contrast>
      <Button.Normal onClick={handlePrev}>Prev</Button.Normal>
    </Space.Modifiers>
  );
}

export default Reader;

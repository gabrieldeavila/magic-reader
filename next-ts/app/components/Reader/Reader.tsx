import { Button, Space } from "@geavila/gt-design";
import { useTriggerState } from "react-trigger-state";
import Phrase from "./Phrase";
import {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ReadContent } from "./styles";
import { db } from "../Dexie/Dexie";

function Reader() {
  const [readingBook] = useTriggerState({ name: "reading_book", initial: {} });

  const [currPage, setCurrPage] = useState(readingBook.currPage || 0);
  const readerRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);

  const changePage = useCallback(() => {
    // changes the currentPage of the readingBook in the database
    try {
      db?.pdfs?.update?.(parseInt(readingBook.id), {
        currPage,
        updatedAt: new Date(),
      });
    } catch {}
  }, [currPage]);

  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }

    changePage();
  }, [changePage]);

  const lines = useMemo(() => {
    if (!readingBook.pages) return [];

    return readingBook.pages[currPage];
  }, [readingBook, currPage]);

  const handleNext = useCallback(() => {
    if (currPage === readingBook.pages.length - 1) return;

    setCurrPage((prev) => prev + 1);
  }, [currPage, readingBook]);

  const handlePrev = useCallback(() => {
    if (currPage === 0) return;

    setCurrPage((prev) => prev - 1);
  }, [currPage, readingBook]);

  useEffect(() => {
    const handleResize = () => {
      if (!readerRef.current) return;

      const navHeight = navRef.current?.clientHeight || 0;
      const readerHeight = window.innerHeight - navHeight * 2 - 32;
      readerRef.current.style.height = `${readerHeight}px`;

      const width = window.innerWidth;
      readerRef.current.style.width = `${width}px`;
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <Space.Modifiers overflow="hidden" flexDirection="column" p="1rem">
      <ReaderNav handlePrev={handlePrev} handleNext={handleNext} />

      <Space.Modifiers justifyContent="center" ref={readerRef}>
        <ReadContent my="1rem" overflowX="hidden" overflowY="auto">
          <Space.Modifiers flexDirection="column">
            {lines.map((phrase: string, index: number) => (
              <Phrase key={index} index={index} phrase={phrase} />
            ))}
          </Space.Modifiers>
        </ReadContent>
      </Space.Modifiers>

      <ReaderNav ref={navRef} handlePrev={handlePrev} handleNext={handleNext} />
    </Space.Modifiers>
  );
}

export default Reader;

const ReaderNav = memo(
  forwardRef(
    (
      {
        handlePrev,
        handleNext,
      }: {
        handlePrev: () => void;
        handleNext: () => void;
      },
      ref
    ) => {
      return (
        <Space.Modifiers ref={ref} gridGap="1rem">
          <Button.Normal onClick={handlePrev}>Prev</Button.Normal>
          <Button.Contrast onClick={handleNext}>Next</Button.Contrast>
        </Space.Modifiers>
      );
    }
  )
);

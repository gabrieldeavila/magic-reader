import {
  Button,
  GTModal,
  Space,
  Text,
  useGTTranslate,
} from "@geavila/gt-design";
import { stateStorage, useTriggerState } from "react-trigger-state";
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
import { ReadContent, ReadWrapper } from "./styles";
import { db } from "../Dexie/Dexie";
import { IModalData } from "./interface";
import { useRouter } from "next/navigation";
import useReadingTime from "./utils/useReadingTime";

function Reader() {
  const [readingBook] = useTriggerState({ name: "reading_book", initial: {} });

  const [currPage, setCurrPage] = useState(readingBook.currPage || 0);
  const readerRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);

  const changePage = useCallback(() => {
    // changes the currentPage of the readingBook in the database
    try {
      db?.pdfs?.update?.(parseInt(readingBook.id), {
        currPage,
        updatedAt: new Date(),
      });
      // puts the scroll to the top of the page
      pageRef.current?.scrollTo(0, 0);
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

  const pageWords = useMemo(() => {
    if (!readingBook.pages) return 0;

    return readingBook.pages[currPage].reduce((acc, curr) => {
      return acc + curr.split(" ").length;
    }, 0);
  }, [readingBook, currPage]);

  const handleNext = useCallback(() => {
    if (currPage === readingBook.pages.length - 1) return;

    setCurrPage((prev) => prev + 1);
  }, [currPage, readingBook]);

  const handlePrev = useCallback(() => {
    if (currPage === 0) return;

    setCurrPage((prev) => prev - 1);
  }, [currPage, readingBook]);

  const disabledNav = useMemo(() => {
    if (!readingBook.pages)
      return {
        prev: true,
        next: true,
      };

    return {
      prev: currPage === 0,
      next: currPage === readingBook.pages.length - 1,
    };
  }, [currPage, readingBook]);

  useEffect(() => {
    const handleResize = () => {
      if (!readerRef.current) return;

      const navHeight = navRef.current?.clientHeight || 0;
      const readerHeight = window.innerHeight - navHeight * 2 - 32 - 16 * 3.25;
      readerRef.current.style.height = `${readerHeight}px`;
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useReadingTime({
    currPage,
    words: pageWords,
  });

  return (
    <Space.Modifiers
      // @ts-expect-error - do later
      overflow="hidden"
      flexDirection="column"
      py="1rem"
      px="1.5rem"
      width="-webkit-fill-available"
    >
      <ReaderNav
        disabledNav={disabledNav}
        handlePrev={handlePrev}
        handleNext={handleNext}
      />
      <Space.Modifiers
        // @ts-expect-error - do later
        position="relative"
        justifyContent="center"
        width="-webkit-fill-available"
        ref={readerRef}
      >
        {/* @ts-expect-error */}
        <ReadWrapper my="1rem">
          <ReadContent ref={pageRef}>
            {/* @ts-expect-error */}
            <Space.Modifiers flexDirection="column">
              {lines.map((phrase: string, index: number) => (
                <Phrase key={index} index={index} phrase={phrase} />
              ))}
            </Space.Modifiers>
          </ReadContent>

          <Space.Modifiers
            // @ts-expect-error - do later
            position="absolute"
            justifyContent="space-between"
            bottom="1rem"
            left="1rem"
            right="1rem"
          >
            <Text.P>{pageWords} words</Text.P>
            <Text.P>
              {currPage + 1} / {readingBook.pages?.length}
            </Text.P>
          </Space.Modifiers>
        </ReadWrapper>
      </Space.Modifiers>

      <ReaderNav
        ref={navRef}
        disabledNav={disabledNav}
        handlePrev={handlePrev}
        handleNext={handleNext}
      />
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
        disabledNav,
      }: {
        handlePrev: () => void;
        handleNext: () => void;
        disabledNav: {
          prev: boolean;
          next: boolean;
        };
      },
      ref: any
    ) => {
      const { translateThis } = useGTTranslate();

      const label = useMemo(() => {
        return {
          prev: disabledNav.prev ? "LEGERE.REACHED_START" : "LEGERE.PREV",
          next: disabledNav.next ? "LEGERE.REACHED_END" : "LEGERE.NEXT",
        };
      }, [disabledNav]);

      return (
        // @ts-expect-error - do later
        <Space.Modifiers ref={ref} gridGap="1rem">
          <Button.Normal disabled={disabledNav.prev} onClick={handlePrev}>
            {translateThis(label.prev)}
          </Button.Normal>
          <Button.Contrast disabled={disabledNav.next} onClick={handleNext}>
            {translateThis(label.next)}
          </Button.Contrast>
        </Space.Modifiers>
      );
    }
  )
);

export const ReaderModal = memo(() => {
  const [showModalBasic, setShowModalBasic] = useTriggerState({
    name: "show_modal_reader",
    initial: false,
  });

  const modalData = useRef<IModalData>({
    title: "LEGERE.INFO",
    orientationY: "center",
    orientationX: "center",
  });

  // 555.22622 -> 555.26
  const wpm = useMemo(() => {
    if (typeof window === "undefined") return 0;

    const wpm = localStorage.getItem("currPerMinute");
    if (!wpm) return 0;

    return parseFloat(wpm).toFixed(2);
  }, [showModalBasic]);

  const { translateThis } = useGTTranslate();

  return (
    <GTModal
      data={modalData.current}
      show={showModalBasic}
      setShow={setShowModalBasic}
    >
      {/* @ts-expect-error */}
      <Space.Between alignItems="center">
        <Text.Strong>{translateThis("LEGERE.WPM")}:</Text.Strong>

        <Text.P>{wpm}</Text.P>
      </Space.Between>
    </GTModal>
  );
});

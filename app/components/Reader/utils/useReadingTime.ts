import { useIsFirstRender } from "@geavila/gt-design";
import { differenceInMinutes, differenceInSeconds } from "date-fns";
import { useEffect } from "react";
import { globalState } from "react-trigger-state";

const PREV = "reader_prev_page";

const GET_PREV = () => globalState.get(PREV);

const SET_PREV = (page: number) =>
  globalState.set(PREV, { page, time: Date.now() });

function useReadingTime({
  currPage,
  words,
}: {
  currPage: number;
  words: number;
}) {
  const isFirstRender = useIsFirstRender();

  useEffect(() => {
    if (isFirstRender) return;

    if (typeof window === "undefined") return;

    // check if the page is already in the database
    // if it is, update the end time
    // if it isn't, create a new entry
    const checkPage = async () => {
      const prev = GET_PREV()?.time;
      console.log(prev);
      if (!prev) return;

      const diff = differenceInSeconds(Date.now(), prev);

      if (diff < 10) return;
      // returns the words per minute read
      const wpm = (60 * words) / diff;

      const currPerMinute = localStorage.getItem("currPerMinute");

      if (currPerMinute) {
        const curr = Number(currPerMinute);

        const newPerMinute = (curr + wpm) / 2;

        localStorage.setItem("currPerMinute", String(newPerMinute));
      } else {
        localStorage.setItem("currPerMinute", String(wpm));
      }
    };

    checkPage();

    SET_PREV(currPage);
  }, [currPage]);
}

export default useReadingTime;

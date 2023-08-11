import { useCallback } from "react";
import { globalState } from "react-trigger-state";
import { ISetRange } from "../interface";

function useSetRange({ ref, editableInfo }: ISetRange) {
  const setRange = useCallback(() => {
    const refInstance = ref.current;

    const selection = window.getSelection();

    const range = document.createRange();
    const cursorPosition = globalState.get("cursorPosition");

    const cursorPositionValue =
      cursorPosition ?? editableInfo?.current.selection;

    const length = refInstance?.childNodes[0]?.textContent?.length;
    const isBigger = cursorPositionValue > length;

    console.log({ cursorPositionValue });

    if (!cursorPositionValue || isBigger) return;

    range.setStart(refInstance.childNodes[0], cursorPositionValue);
    range.setEnd(refInstance.childNodes[0], cursorPositionValue);

    selection.removeAllRanges();
    selection.addRange(range);

    // globalState.set("cursorPosition", undefined);
  }, [editableInfo, ref]);

  return {
    setRange,
  };
}

export default useSetRange;

import { useCallback, useEffect } from "react";
import { globalState } from "react-trigger-state";
import { dss } from "../../../utils/dss";
import { useContextName } from "../context/WriterContext";
import useGetCurrBlockId from "./useGetCurrBlockId";
import usePositions from "./usePositions";

function useRange() {
  const { getSelectedBlocks } = usePositions({});
  const { getBlockId } = useGetCurrBlockId();
  const contextName = useContextName();

  const getSelectedRange = useCallback(() => {
    const { dataLineId } = getBlockId({});

    const text = globalState
      .get(contextName)
      .find((item) => item.id === dataLineId)?.text;

    if (!text) return {};

    const info = getSelectedBlocks(text);
    const { first, last } = info;
    globalState.set("prev_range", { first, last });

    const range = dss(first.id, first.index, last.id, last.index);
    const bounds = range.getBoundingClientRect();
    const selector = document.querySelector(
      "[data-link-selector]"
    ) as HTMLElement;
    selector.style.top = `${bounds.bottom - bounds.height}px`;
    selector.style.left = `${bounds.left}px`;
    selector.style.height = `${bounds.height}px`;
    selector.style.width = `${bounds.width}px`;

    // block the scroll
    document.body.style.overflow = "hidden";
  }, [contextName, getBlockId, getSelectedBlocks]);

  const hideSelector = useCallback(() => {
    document.body.style.overflow = "auto";
    const selector = document.querySelector(
      "[data-link-selector]"
    ) as HTMLElement;

    if (!selector) return;

    selector.style.top = "0px";
    selector.style.width = "0px";
  }, []);

  useEffect(() => {
    return () => {
      hideSelector();
    };
  }, [hideSelector]);

  const setPrevRange = useCallback(() => {
    const { first, last } = globalState.get("prev_range");

    const range = dss(first.id, first.index, last.id, last.index);

    const selection = window.getSelection();

    if (!selection) return;

    selection.removeAllRanges();
    selection.addRange(range);
  }, []);

  return { getSelectedRange, hideSelector, setPrevRange };
}

export default useRange;

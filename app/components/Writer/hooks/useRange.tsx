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

    const { first, last } = getSelectedBlocks(text);

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

  useEffect(() => {
    return () => {
      document.body.style.overflow = "auto";
      const selector = document.querySelector(
        "[data-link-selector]"
      ) as HTMLElement;

      selector.style.top = "0px";
      selector.style.width = "0px";
    };
  }, []);

  return { getSelectedRange };
}

export default useRange;

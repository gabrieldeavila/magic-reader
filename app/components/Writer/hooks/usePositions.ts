import { useGTToastContext } from "@geavila/gt-design";
import { useCallback, useMemo } from "react";
import { stateStorage } from "react-trigger-state";
import { IText } from "../interface";

function usePositions({ text }: { text: IText[] }) {
  const mimic = useMemo(
    () =>
      text.reduce((acc, item) => {
        const words = item.value.split("");

        words.forEach((letter, index) => {
          acc.push({
            letter: letter,
            id: item.id,
            index,
          });
        });

        return acc;
      }, []),
    [text]
  );

  const { toast } = useGTToastContext();

  const getFirstAndLastNode = useCallback(() => {
    const selection = window.getSelection();

    const anchor = selection.anchorNode?.parentElement;
    const anchorOffset = selection.anchorOffset;

    const focus = selection.focusNode?.parentElement;
    const focusOffset = selection.focusOffset;

    const areTheSame = anchor === focus;

    // if are the same, checks if the anchorOffset is less than the focusOffset
    const isAnchorOffsetLessThanFocusOffset =
      areTheSame && anchorOffset < focusOffset;

    // see which node is the first
    // if the anchor is the first, then the focus is the last
    const anchorComesFirst =
      anchor?.compareDocumentPosition(focus) &
        Node.DOCUMENT_POSITION_FOLLOWING || isAnchorOffsetLessThanFocusOffset;

    const firstNodeIsCode = anchor?.parentElement?.tagName === "CODE";
    const lastNodeIsCode = focus?.parentElement?.tagName === "CODE";

    let firstNode = anchorComesFirst ? anchor : focus;
    let lastNode = anchorComesFirst ? focus : anchor;

    if (firstNodeIsCode) {
      // gets the one being selected
      firstNode = firstNode?.parentElement?.parentElement?.parentElement;
    }

    if (lastNodeIsCode) {
      // gets the one being selected
      lastNode = lastNode?.parentElement?.parentElement?.parentElement;
    }

    const prevSelectionRange = stateStorage.get("selection_range");

    const firstNodeOffset =
      prevSelectionRange?.start || anchorComesFirst
        ? anchorOffset
        : focusOffset;

    const lastNodeOffset =
      (prevSelectionRange?.end ||
        (anchorComesFirst ? focusOffset : anchorOffset)) - 1;

    const firstNodeId = parseFloat(firstNode?.getAttribute("data-block-id"));

    const lastNodeId = parseFloat(lastNode?.getAttribute("data-block-id"));

    let firstIdIndex = 0;

    if (!firstNodeId || !lastNodeId) {
      toast("LEGERE.NO_SELECTION", {
        type: "error",
      });

      return {};
    }

    console.log(firstNodeId, lastNodeId, mimic, selection);

    const firstNodeIndex = mimic.findIndex(({ id }) => {
      if (id == firstNodeId) {
        return firstIdIndex++ === firstNodeOffset;
      }

      return false;
    });

    let lastIdIndex = 0;

    const lastNodeIndex = mimic.findIndex(({ id }) => {
      if (id == lastNodeId) {
        return lastIdIndex++ === lastNodeOffset;
      }

      return false;
    });

    return {
      firstNodeIndex,
      lastNodeIndex,
      areTheSame,
      firstNodeOffset,
      lastNodeOffset,
    };
  }, [mimic, toast]);

  const getSelectedBlocks = useCallback(() => {
    const { firstNodeIndex, lastNodeIndex } = getFirstAndLastNode();

    const selected = mimic.slice(firstNodeIndex, lastNodeIndex + 1);

    // gets the ids of the selected (unique)
    const selectedIds = selected.reduce((acc, item) => {
      if (!acc.includes(item.id)) acc.push(item.id);

      return acc;
    }, []);

    const selectedBlocks = text.filter(({ id }) => selectedIds.includes(id));
    console.log(selected, firstNodeIndex, lastNodeIndex);

    return {
      selectedBlocks,
      firstNodeIndex,
      lastNodeIndex,
      first: {
        id: selected[0].id,
        index: selected[0].index,
      },
      last: {
        id: selected[selected.length - 1].id,
        index: selected[selected.length - 1].index,
      },
    };
  }, [getFirstAndLastNode, mimic, text]);

  return { getFirstAndLastNode, getSelectedBlocks };
}

export default usePositions;

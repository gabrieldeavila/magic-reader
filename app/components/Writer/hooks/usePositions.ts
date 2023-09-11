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

    let firstNode = anchorComesFirst ? anchor : focus;
    let lastNode = anchorComesFirst ? focus : anchor;

    const firstNodeIsCode = firstNode?.parentElement?.tagName === "CODE";
    const lastNodeIsCode = lastNode?.parentElement?.tagName === "CODE";

    let firstCode, lastCode;

    if (firstNodeIsCode) {
      // gets the one being selected
      firstCode = firstNode;
      firstNode = firstNode?.parentElement?.parentElement?.parentElement;
    }

    if (lastNodeIsCode) {
      // gets the one being selected
      lastCode = lastNode;
      lastNode = lastNode?.parentElement?.parentElement?.parentElement;
    }

    const prevSelectionRange = stateStorage.get("selection_range");

    let firstNodeOffset =
      prevSelectionRange?.start || anchorComesFirst
        ? anchorOffset
        : focusOffset;

    let lastNodeOffset =
      (prevSelectionRange?.end ||
        (anchorComesFirst ? focusOffset : anchorOffset)) - 1;

    const firstNodeId = parseFloat(firstNode?.getAttribute("data-block-id"));

    const lastNodeId = parseFloat(lastNode?.getAttribute("data-block-id"));

    const isCodeBlock = !!(
      firstNode?.querySelector("code") || lastNode?.querySelector("code")
    );

    if (isCodeBlock) {
      if (firstNode?.querySelector("code")) {
        // const currBlock
        const codeBlock = firstNode?.querySelector("code");
        const children = Array.from(codeBlock.childNodes);
        let firstIndex = 0;

        children.find((child) => {
          if (child === firstCode) {
            return true;
          }

          // gets the length of the text and adds it to the index
          firstIndex += child.textContent?.length || 0;

          return false;
        });

        firstNodeOffset = firstIndex + firstNodeOffset;
      }

      if (lastNode?.querySelector("code")) {
        const codeBlock = lastNode?.querySelector("code");
        const children = Array.from(codeBlock.childNodes);
        let lastIndex = 0;

        children.find((child) => {
          if (child === lastCode) {
            return true;
          }

          // gets the length of the text and adds it to the index
          lastIndex += child.textContent?.length || 0;

          return false;
        });

        lastNodeOffset = lastIndex + lastNodeOffset;
      }
    }

    let firstIdIndex = 0;

    if (!firstNodeId || !lastNodeId) {
      return {};
    }

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
  }, [mimic]);

  const getSelectedBlocks = useCallback(() => {
    const { firstNodeIndex, lastNodeIndex } = getFirstAndLastNode();

    const selected = mimic.slice(firstNodeIndex, lastNodeIndex + 1);

    // gets the ids of the selected (unique)
    const selectedIds = selected.reduce((acc, item) => {
      if (!acc.includes(item.id)) acc.push(item.id);

      return acc;
    }, []);

    const selectedBlocks = text.filter(({ id }) => selectedIds.includes(id));

    return {
      selectedBlocks,
      firstNodeIndex,
      lastNodeIndex,
      first: {
        id: selected[0]?.id,
        index: selected[0]?.index,
      },
      last: {
        id: selected[selected.length - 1]?.id,
        index: selected[selected.length - 1]?.index,
      },
    };
  }, [getFirstAndLastNode, mimic, text]);

  const getBlockId = useCallback(() => {
    console.log(getFirstAndLastNode());
  }, [getFirstAndLastNode]);

  return { getFirstAndLastNode, getSelectedBlocks, getBlockId };
}

export default usePositions;

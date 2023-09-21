import { useCallback, useMemo } from "react";
import { stateStorage } from "react-trigger-state";
import { IText } from "../interface";
import useLinesBetween from "./useLinesBetween";

function usePositions({ text }: { text: IText[] }) {
  const mimic = useMemo(
    () =>
      text.reduce((acc, item) => {
        let words = item.value.split("");

        if (!words.length) {
          words = [""];
        }

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

  const { getLinesBetween } = useLinesBetween();

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

    let firstNodeId = firstNode?.getAttribute("data-block-id");

    let lastNodeId = lastNode?.getAttribute("data-block-id");

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

    const areFromDiffLines =
      firstNode?.closest("[data-line-id]") !==
      lastNode?.closest("[data-line-id]");

    let letters = mimic;
    let multiLineInfo = { selectedBlocks: [], linesBetween: [] };

    if (areFromDiffLines) {
      const { newLastLineId, newFirstLineId, newMimic, ...props } =
        getLinesBetween({
          firstLineId: firstNode
            ?.closest("[data-line-id]")
            ?.getAttribute("data-line-id"),
          lastLineId: lastNode
            ?.closest("[data-line-id]")
            ?.getAttribute("data-line-id"),
        });

      letters = newMimic;
      multiLineInfo = props;

      if (props.linesBetween.length === 1) {
        const lineId = props.linesBetween[0].id;
        // gets the letters with the lineId
        const testingLetters = newMimic.filter(
          ({ lineId: id }) => id === lineId
        );

        // if the only line is not the same as the selected
        // the first node is not going to be the same
        if (firstNodeId !== testingLetters[firstNodeOffset].id) {
          firstNodeId = props.selectedBlocks[0]?.id;
          firstNodeOffset = 0;
        }

        // the same for the last node
        if (lastNodeId !== testingLetters[lastNodeOffset + 1].id) {
          lastNodeId =
            props.selectedBlocks[props.selectedBlocks.length - 1]?.id;

          lastNodeOffset =
            props.selectedBlocks[props.selectedBlocks.length - 1].value.length -
            1;
        }
      } else {
        if (newFirstLineId) {
          firstNodeId = newFirstLineId;
        }

        if (newLastLineId) {
          lastNodeId = newLastLineId;
        }
      }
    }

    const firstNodeIndex = letters.findIndex(({ id }) => {
      if (id == firstNodeId) {
        return firstIdIndex++ === firstNodeOffset;
      }

      return false;
    });

    let lastIdIndex = 0;

    const lastNodeIndex = letters.findIndex(({ id }) => {
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
      selectedLetters: letters,
      areFromDiffLines,
      multiLineInfo,
    };
  }, [getLinesBetween, mimic]);

  const getSelectedBlocks = useCallback(() => {
    const {
      firstNodeIndex,
      lastNodeIndex,
      selectedLetters,
      areFromDiffLines,
      multiLineInfo,
    } = getFirstAndLastNode();
    const selected = selectedLetters.slice(firstNodeIndex, lastNodeIndex + 1);

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
      selectedLetters,
      areFromDiffLines,
      multiLineInfo,
    };
  }, [getFirstAndLastNode, text]);

  return { getFirstAndLastNode, getSelectedBlocks };
}

export default usePositions;

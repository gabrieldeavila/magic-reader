import { useGTToastContext } from "@geavila/gt-design";
import {
  memo,
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Code, PenTool } from "react-feather";
import { stateStorage, useTriggerState } from "react-trigger-state";
import { useWriterContext } from "../context/WriterContext";
import { IPopup } from "../interface";
import WPopup from "./style";

const Popup = memo(({ id, text, parentRef }: IPopup) => {
  const { toast } = useGTToastContext();
  const { handleUpdate } = useWriterContext();

  const ref = useRef<HTMLDivElement>(null);

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

  const isUp = useMemo(() => {
    if (!parentRef.current) return false;

    // if the top is less than 100, then the popup should be below the text
    return false;
  }, [parentRef]);

  const [updatePositions] = useTriggerState({
    name: "force_popup_positions_update",
  });

  const [positions, setPositions] = useState({});

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

  const [selectedOptions, setSelectedOptions] = useState([]);

  const handleColors = useCallback(() => {
    const { firstNodeIndex, lastNodeIndex } = getFirstAndLastNode();

    const selected = mimic.slice(firstNodeIndex, lastNodeIndex + 1);

    // gets the ids of the selected (unique)
    const selectedIds = selected.reduce((acc, item) => {
      if (!acc.includes(item.id)) acc.push(item.id);

      return acc;
    }, []);

    const selectedBlocks = text.filter(({ id }) => selectedIds.includes(id));

    // gets the options that are in all the selected
    const options = selectedBlocks.reduce((acc, item, index) => {
      if (index === 0) {
        acc.push(...item.options);
        return acc;
      }

      const newAcc = [];

      acc.forEach((option) => {
        if (item.options.includes(option)) newAcc.push(option);
      });

      return newAcc;
    }, []);
    console.log("fuuck", options);

    setSelectedOptions(options);
  }, [getFirstAndLastNode, mimic, text]);

  useLayoutEffect(() => {
    // gets the position of the selected text
    const selection = window.getSelection();
    const position = selection?.getRangeAt(0)?.getBoundingClientRect?.();

    if (!position) return;

    handleColors();

    const width = ref.current?.getBoundingClientRect()?.width;

    const left = position.right + width;
    // sees if the popup is out of the screen
    const isOutOfScreen = window.innerWidth < left;

    let newPositions = {};

    let newLeft;
    const newTop = position.top + window.scrollY + 25;

    if (isOutOfScreen) {
      newLeft = position.left - width;
    } else {
      newLeft = position.right - position.width;
    }

    if (newLeft < 0) newLeft = position.x;

    newPositions = {
      left: `${newLeft}px`,
      top: `${newTop}px`,
    };

    setPositions(newPositions);
  }, [handleColors, updatePositions]);

  const addDecoration = useCallback(
    (decoration: string) => {
      const {
        firstNodeIndex,
        areTheSame,
        lastNodeIndex,
        firstNodeOffset,
        lastNodeOffset,
      } = getFirstAndLastNode();

      if (firstNodeIndex === -1 || lastNodeIndex === -1) {
        toast("LEGERE.NO_SELECTION", {
          type: "error",
        });

        return;
      }

      // gets the letters between the first and last node
      const selected = mimic.slice(firstNodeIndex, lastNodeIndex + 1);

      const wordsBeforeSelected = [];
      const wordsAfterSelected = [];

      let wordsAreBefore = true;
      let wordsSelected = [];

      if (selected.length) {
        wordsSelected = text.filter((item) => {
          const { id } = item;

          const isSelected = selected.some(
            ({ id: selectedId }) => selectedId === id
          );

          if (isSelected) wordsAreBefore = false;

          if (wordsAreBefore) {
            wordsBeforeSelected.push(item);
          } else if (!isSelected) {
            wordsAfterSelected.push(item);
          }

          return isSelected;
        });
      }

      const allAlreadyHaveOption = wordsSelected.every(({ options }) =>
        options.includes(decoration)
      );

      // removes the first and last selected
      const selectedWithoutFirstAndLast = wordsSelected
        .slice(1, -1)
        .map((item) => {
          if (allAlreadyHaveOption) {
            return {
              ...item,
              options: item.options.filter((option) => option !== decoration),
            };
          }

          if (item.options.includes(decoration)) return item;

          return {
            ...item,
            options: [...item.options, decoration],
          };
        });

      const newWords = [...wordsBeforeSelected];

      // now checks if the first word will be sliced, if so, it'll generate 2 words
      if (
        (selected?.[0]?.index !== 0 || areTheSame) &&
        selected?.[0]?.index != null
      ) {
        const firstWord = wordsSelected[0];

        // if areTheSame, then the first word will be sliced in 2
        if (areTheSame) {
          const { first, second, third } = firstWord.value.split("").reduce(
            (acc, item, index) => {
              if (index < firstNodeOffset) acc.first += item;
              else if (index > lastNodeOffset) acc.third += item;
              else acc.second += item;

              return acc;
            },
            {
              first: "",
              second: "",
              third: "",
            }
          );

          if (first) {
            newWords.push({
              ...firstWord,
              value: first,
            });
          }

          if (second) {
            newWords.push({
              ...firstWord,
              value: second,
              options: firstWord.options.includes(decoration)
                ? allAlreadyHaveOption
                  ? firstWord.options.filter((option) => option !== decoration)
                  : firstWord.options
                : [...firstWord.options, decoration],
            });
          }

          if (third) {
            newWords.push({
              ...firstWord,
              value: third,
            });
          }
        } else {
          const firstWordSliced = {
            ...firstWord,
            value: firstWord.value.slice(0, selected[0].index),
          };

          const firstWordSliced2 = {
            ...firstWord,
            value: firstWord.value.slice(selected[0].index),
            options: firstWord.options.includes(decoration)
              ? allAlreadyHaveOption
                ? firstWord.options.filter((option) => option !== decoration)
                : firstWord.options
              : [...firstWord.options, decoration],
          };

          newWords.push(firstWordSliced);
          newWords.push(firstWordSliced2);
        }
      } else if (selected?.[0]?.index != null) {
        newWords.push({
          ...wordsSelected[0],
          options: wordsSelected[0].options.includes(decoration)
            ? allAlreadyHaveOption
              ? wordsSelected[0].options.filter(
                  (option) => option !== decoration
                )
              : wordsSelected[0].options
            : [...wordsSelected[0].options, decoration],
        });
      }

      // the rest of the words are just copied
      newWords.push(...selectedWithoutFirstAndLast);

      // now checks if the last word will be sliced
      if (
        selected[selected.length - 1]?.index !==
          wordsSelected?.[wordsSelected.length - 1]?.value?.length - 1 &&
        selected[selected.length - 1]?.index != null &&
        selected[selected.length - 1]?.id !== selected?.[0]?.id
      ) {
        const lastWord = wordsSelected[wordsSelected.length - 1];

        const lastWordSliced = {
          ...lastWord,
          value: lastWord.value.slice(
            0,
            selected[selected.length - 1].index + 1
          ),
          options: lastWord.options.includes(decoration)
            ? allAlreadyHaveOption
              ? lastWord.options.filter((option) => option !== decoration)
              : lastWord.options
            : [...lastWord.options, decoration],
        };

        const lastWordSliced2 = {
          ...lastWord,
          value: lastWord.value.slice(selected[selected.length - 1].index + 1),
        };

        newWords.push(lastWordSliced);
        newWords.push(lastWordSliced2);
      } else if (
        selected[selected.length - 1]?.index != null &&
        selected[selected.length - 1]?.id !== selected?.[0]?.id
      ) {
        newWords.push({
          ...wordsSelected[wordsSelected.length - 1],
          options: wordsSelected[wordsSelected.length - 1].options.includes(
            decoration
          )
            ? allAlreadyHaveOption
              ? wordsSelected[wordsSelected.length - 1].options.filter(
                  (option) => option !== decoration
                )
              : wordsSelected[wordsSelected.length - 1].options
            : [...wordsSelected[wordsSelected.length - 1].options, decoration],
        });
      }

      newWords.push(...wordsAfterSelected);

      // sees if can merge some words, because they have the same options
      const finalWords = [];
      let tempOptions = [];

      newWords.forEach((item, index) => {
        // if is the first item, just add it to the tempOptions
        if (index === 0) {
          tempOptions.push(item);
          return;
        }

        // if the current item has the same options as the previous one, just add it to the tempOptions
        if (item.options.join("") === tempOptions[0].options.join("")) {
          tempOptions.push(item);
          return;
        }

        // if the current item has different options than the previous one, then add the tempOptions to the finalWords
        if (tempOptions.length > 0) {
          finalWords.push({
            ...tempOptions[0],
            value: tempOptions.map(({ value }) => value).join(""),
          });
        }

        // and then, reset the tempOptions
        tempOptions = [item];
      });

      // if the last item is not in the tempOptions, then it'll add it
      if (tempOptions.length > 0) {
        finalWords.push({
          ...tempOptions[0],
          value: tempOptions.map(({ value }) => value).join(""),
        });
      }

      // now, give unique ids to the words
      const newText = finalWords.map((item, index) => {
        return {
          ...item,
          id: parseInt(`${new Date().getTime()}${index}`),
        };
      });

      let tempStartIndex = 0;
      let startBlockId = null;
      let newFirstNodeIndex = 0;

      newText.find((item) => {
        const letters = item.value.split("");

        const letterIndex = letters.findIndex((__, index) => {
          if (tempStartIndex === firstNodeIndex) {
            startBlockId = item.id;
            newFirstNodeIndex = index;
            return true;
          }

          tempStartIndex++;

          return false;
        });

        return letterIndex !== -1;
      });

      let tempEndIndex = 0;
      let endBlockId = null;
      let newLastNodeIndex = 0;

      newText.find((item) => {
        const letters = item.value.split("");

        const letterIndex = letters.findIndex((__, index) => {
          if (tempEndIndex === lastNodeIndex) {
            endBlockId = item.id;
            newLastNodeIndex = index + 1;

            return true;
          }

          tempEndIndex++;

          return false;
        });

        return letterIndex !== -1;
      });

      stateStorage.set("selection_range", {
        start: newFirstNodeIndex,
        end: newLastNodeIndex,
        startBlockId,
        endBlockId,
      });

      handleUpdate(id, newText);
    },
    [getFirstAndLastNode, handleUpdate, id, mimic, text, toast]
  );

  const bold = useCallback(() => {
    addDecoration("bold");
  }, [addDecoration]);

  const italic = useCallback(() => {
    addDecoration("italic");
  }, [addDecoration]);

  const underline = useCallback(() => {
    addDecoration("underline");
  }, [addDecoration]);

  const strikethrough = useCallback(() => {
    addDecoration("strikethrough");
  }, [addDecoration]);

  const code = useCallback(() => {
    addDecoration("code");
  }, [addDecoration]);

  const highlight = useCallback(() => {
    addDecoration("highlight");
  }, [addDecoration]);

  return (
    <WPopup.Wrapper
      style={positions}
      isUp={isUp}
      contentEditable={false}
      ref={ref}
    >
      <WPopup.Content>
        <WPopup.Item>
          <WPopup.B
            isSelected={selectedOptions.includes("bold")}
            onClick={bold}
          >
            B
          </WPopup.B>
        </WPopup.Item>

        <WPopup.Item>
          <WPopup.I
            isSelected={selectedOptions.includes("italic")}
            onClick={italic}
          >
            i
          </WPopup.I>
        </WPopup.Item>

        <WPopup.Item>
          <WPopup.U
            isSelected={selectedOptions.includes("underline")}
            onClick={underline}
          >
            U
          </WPopup.U>
        </WPopup.Item>

        <WPopup.Item>
          <WPopup.S
            isSelected={selectedOptions.includes("strikethrough")}
            onClick={strikethrough}
          >
            S
          </WPopup.S>
        </WPopup.Item>

        <WPopup.Item>
          <WPopup.Code
            isSelected={selectedOptions.includes("highlight")}
            onClick={highlight}
          >
            <PenTool size={14} />
          </WPopup.Code>
        </WPopup.Item>

        <WPopup.Item>
          <WPopup.Code
            isSelected={selectedOptions.includes("code")}
            onClick={code}
          >
            <Code size={14} />
          </WPopup.Code>
        </WPopup.Item>
      </WPopup.Content>
    </WPopup.Wrapper>
  );
});

Popup.displayName = "Popup";

export default Popup;

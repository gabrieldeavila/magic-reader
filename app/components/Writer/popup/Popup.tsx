import { useGTToastContext } from "@geavila/gt-design";
import { memo, useCallback, useMemo } from "react";
import { stateStorage } from "react-trigger-state";
import { useWriterContext } from "../context/WriterContext";
import { IPopup } from "../interface";
import WPopup from "./style";

const Popup = memo(({ id, text, parentRef }: IPopup) => {
  const { toast } = useGTToastContext();
  const { handleUpdate } = useWriterContext();

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

    const bounding = parentRef.current.getBoundingClientRect();

    // if the top is less than 100, then the popup should be below the text
    return bounding.top < 100;
  }, [parentRef]);

  const addDecoration = useCallback(
    (decoration: string) => {
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

      const firstNode = anchorComesFirst ? anchor : focus;
      const lastNode = anchorComesFirst ? focus : anchor;

      const firstNodeOffset = anchorComesFirst ? anchorOffset : focusOffset;
      const lastNodeOffset =
        (anchorComesFirst ? focusOffset : anchorOffset) - 1;

      const firstNodeId = parseInt(firstNode?.getAttribute("data-block-id"));

      const lastNodeId = parseInt(lastNode?.getAttribute("data-block-id"));

      let firstIdIndex = 0;

      if (!firstNodeId || !lastNodeId) {
        toast("LEGERE.NO_SELECTION", {
          type: "error",
        });

        return;
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
          if (tempEndIndex === lastNodeIndex + 1) {
            endBlockId = item.id;
            newLastNodeIndex = index;
            return true;
          }

          tempEndIndex++;

          return false;
        });

        return letterIndex !== -1;
      });

      // console.log(selected, newText, firstNodeIndex, tempStartIndex);

      stateStorage.set("selection_range", {
        start: newFirstNodeIndex,
        end: newLastNodeIndex,
        startBlockId,
        endBlockId,
      });

      handleUpdate(id, newText);
    },
    [handleUpdate, id, mimic, text, toast]
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

  return (
    <WPopup.Wrapper isUp={false} contentEditable={false}>
      <WPopup.Content>
        <WPopup.Item>
          <WPopup.B onClick={bold}>B</WPopup.B>
        </WPopup.Item>

        <WPopup.Item>
          <WPopup.I onClick={italic}>i</WPopup.I>
        </WPopup.Item>

        <WPopup.Item>
          <WPopup.U onClick={underline}>U</WPopup.U>
        </WPopup.Item>
      </WPopup.Content>
    </WPopup.Wrapper>
  );
});

Popup.displayName = "Popup";

export default Popup;

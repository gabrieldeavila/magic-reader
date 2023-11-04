import { useGTToastContext } from "@geavila/gt-design";
import { useCallback, useMemo, useState } from "react";
import { IText } from "../interface";
import usePositions from "./usePositions";
import { useWriterContext } from "../context/WriterContext";
import { globalState, stateStorage } from "react-trigger-state";
import uuid from "../../../utils/uuid";

function useDecoration({ id, text }: { id: string; text: IText[] }) {
  const { toast } = useGTToastContext();
  const { getFirstAndLastNode } = usePositions({ text });
  const { handleUpdate, addToCtrlZ } = useWriterContext();
  const [selectedOptions, setSelectedOptions] = useState([]);

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

  const doTheDecoration = useCallback(
    ({
      decoration,
      firstNodeIndex,
      lastNodeIndex,
      letters,
      areTheSame,
      firstNodeOffset,
      lastNodeOffset,
      id: dId,
      selected,
      isLast,
      anchorComesFirst,
      custom,
    }) => {
      const wordsBeforeSelected = [];
      const wordsAfterSelected = [];

      let wordsAreBefore = true;
      let wordsSelected = [];

      if (selected.length) {
        wordsSelected = letters.filter((item) => {
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

      const allAlreadyHaveOption = !custom && selectedOptions.includes(decoration);

      // removes the first and last selected
      const selectedWithoutFirstAndLast = wordsSelected
        .slice(1, -1)
        .map((item) => {
          if (allAlreadyHaveOption) {
            return {
              ...item,
              options: item.options.filter((option) => option !== decoration),
              custom,
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
          try {
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
                custom,
                options: firstWord.options.includes(decoration)
                  ? allAlreadyHaveOption
                    ? firstWord.options.filter(
                        (option) => option !== decoration
                      )
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
          } catch {
            console.log(firstWord, "errror");
          }
        } else {
          const firstWordSliced = {
            ...firstWord,
            value: firstWord.value.slice(0, selected[0].index),
          };

          const firstWordSliced2 = {
            ...firstWord,
            value: firstWord.value.slice(selected[0].index),
            custom,
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
          custom,
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
          custom,
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
          custom,
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
      const newText = finalWords.map((item) => {
        return {
          ...item,
          id: uuid(),
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

      const multiLinFirstNode = globalState.get("multi_line_first_node_index");

      if (isLast && multiLinFirstNode != null) {
        newFirstNodeIndex = multiLinFirstNode.index;
        startBlockId = multiLinFirstNode.id;
      }

      handleUpdate(dId, newText);

      if (isLast) {
        // reverts start and end if anchor does not comes first
        if (!anchorComesFirst && multiLinFirstNode != null) {
          dId = multiLinFirstNode.endBlockId;
        }

        if (globalState.get("popup_anchor") == null) {
          globalState.set("popup_anchor", anchorComesFirst);
        }

        stateStorage.set("selection_range", {
          start: newFirstNodeIndex,
          end: newLastNodeIndex,
          startBlockId,
          endBlockId,
          id: dId,
          anchorComesFirst: globalState.get("popup_anchor") ?? anchorComesFirst,
        });
      }

      if (isLast) {
        if (id !== dId) {
          setTimeout(() => {
            stateStorage.set(`close_popup_forced-${id}`, new Date());
            stateStorage.set(`force_popup_positions_update-${dId}`, true);
            stateStorage.set(`has_focus_ev-${dId}`, true);
            globalState.set("prev-selected", dId);
          }, 1);
        }
      }
      return { newFirstNodeIndex, startBlockId, endBlockId: dId };
    },
    [handleUpdate, id, selectedOptions]
  );

  const addDecoration = useCallback(
    (decoration: string, custom?: Record<string, any>) => {
      const {
        firstNodeIndex,
        areTheSame,
        lastNodeIndex,
        firstNodeOffset,
        lastNodeOffset,
        areFromDiffLines,
        multiLineInfo,
        selectedLetters,
        anchorComesFirst,
      } = getFirstAndLastNode();

      if (firstNodeIndex === -1 || lastNodeIndex === -1) {
        toast("LEGERE.NO_SELECTION", {
          type: "error",
        });

        return;
      }

      const selected = (areFromDiffLines ? selectedLetters : mimic).slice(
        firstNodeIndex,
        lastNodeIndex + 1
      );

      if (!areFromDiffLines && selected.length) {
        addToCtrlZ({
          lineId: id,
          value: structuredClone(text),
          action: "delete_letters",
          blockId: selected[0].id,
        });
      }

      if (areFromDiffLines) {
        const { linesBetween } = multiLineInfo;

        let startIndex = 0;
        // sum the length of the lines between
        let stuffToBeSliced = 0;

        linesBetween.forEach((line, key, array) => {
          // removes the old startIndex
          stuffToBeSliced += startIndex;
          const linesLetters = selected.slice(stuffToBeSliced);

          startIndex = 0;

          const currId = linesLetters[startIndex]?.lineId;

          if (!currId) {
            return;
          }

          const fromToLastIndex = linesLetters.findIndex((__, index) => {
            // gets when ends the first line, that is, when the next id is different
            if (index === linesLetters.length - 1) return true;

            const nextId = linesLetters[index + 1]?.lineId;

            return nextId !== currId;
          });

          startIndex = fromToLastIndex + 1;

          const decSelected = linesLetters.slice(0, startIndex);

          const { newFirstNodeIndex, startBlockId, endBlockId } =
            doTheDecoration({
              decoration,
              firstNodeIndex: key === 0 ? firstNodeIndex : 0,
              lastNodeIndex:
                array.length === 1
                  ? firstNodeIndex + fromToLastIndex
                  : fromToLastIndex,
              letters: line.text,
              areTheSame: line.text.length === 1 || key === array.length - 1,
              firstNodeOffset: decSelected[0].index,
              lastNodeOffset: decSelected[decSelected.length - 1].index,
              id: line.id,
              selected: decSelected,
              isLast: key === linesBetween.length - 1,
              anchorComesFirst,
              custom,
            });

          if (key === 0) {
            globalState.set("multi_line_first_node_index", {
              id: startBlockId,
              index: newFirstNodeIndex,
              endBlockId,
            });
          }
        });

        globalState.set("multi_line_first_node_index", null);

        return;
      }

      doTheDecoration({
        decoration,
        firstNodeIndex,
        lastNodeIndex,
        letters: text,
        areTheSame,
        firstNodeOffset,
        lastNodeOffset,
        id,
        selected,
        isLast: true,
        anchorComesFirst,
        custom,
      });
    },
    [addToCtrlZ, doTheDecoration, getFirstAndLastNode, id, mimic, text, toast]
  );

  return {
    selectedOptions,
    setSelectedOptions,
    addDecoration,
  };
}

export default useDecoration;

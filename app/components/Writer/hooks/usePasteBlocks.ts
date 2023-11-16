import { useCallback } from "react";
import uuid from "../../../utils/uuid";
import {
  IText,
  IWritterContent,
  LineOrText,
  TCustomStyle,
  scribereActions,
} from "../interface";

function usePasteBlocks() {
  // returns if has some option: bold, italic, underline, strikethrough, highlight, code
  const getOptions = useCallback((child: ChildNode) => {
    const options = [];

    // @ts-expect-error it sure does
    const style = child?.getAttribute?.("style")?.replace(" ", "") || "";

    const possibleOptions = {
      bold: "bold",
      italic: "italic",
      underline: "underline",
      strikethrough: "strikethrough",
      monospace: "code",
      "font-weight:700;": "bold",
    };

    const possibleTags = {
      STRONG: "bold",
      EM: "italic",
      U: "underline",
      S: "strikethrough",
      CODE: "code",
    };

    Object.entries(possibleOptions).forEach(([key, value]) => {
      if (style.includes(key)) {
        options.push(value);
      }
    });

    Object.entries(possibleTags).forEach(([key, value]) => {
      if (child.nodeName === key) {
        options.push(value);
      }
    });

    return options;
  }, []);

  const findChildOptions = useCallback(
    (child: ChildNode, prevOptions = [], prevChild = []): LineOrText[] => {
      const children = Array.from(child.childNodes);

      prevOptions.push(...getOptions(child));

      const allChildrenAreDivOrP = children.every(
        (item) =>
          item.nodeName === "P" ||
          item.nodeName === "DIV" ||
          item.nodeName === "BR"
      );

      if (prevOptions.includes("code") && !allChildrenAreDivOrP) {
        prevChild.push({
          options: [...new Set(prevOptions)],
          value: child.textContent ?? "",
          id: uuid(),
        });
      } else {
        children.forEach((item) => {
          const options = [...prevOptions, ...getOptions(item)];
          // without duplicates
          if (item.nodeName === "#text") {
            prevChild.push({
              options: [...new Set(options)],
              value: item.textContent ?? "",
              id: uuid(),
            });

            return;
          }

          const hasChildren = item.childNodes.length > 0;
          const isCode = item.nodeName === "CODE";

          if (isCode) {
            options.push("code");
            prevChild.push({
              options: [...new Set(options)],
              value: item.textContent ?? "",
              id: uuid(),
            });
          } else if (hasChildren) {
            findChildOptions(item, options, prevChild);
          }
        });
      }

      return prevChild;
    },
    [getOptions]
  );

  const addBlock = useCallback(
    ({
      type,
      children,
    }: {
      type: "tl" | "nl" | "bl";
      children: ChildNode[];
    }) => {
      const contentToAdd = children.reduce<LineOrText[]>((acc, child) => {
        const newLine = findChildOptions(child, [], []);
        let customStyle = {} as TCustomStyle;

        if (type === "tl") {
          const isChecked = child.textContent?.includes("[x]");
          customStyle = {
            checked: isChecked,
          };

          if ("value" in newLine[0]) {
            // removes the first 4 chars
            newLine[0].value = newLine[0].value.slice(4);
          }
        }

        acc.push({
          type: type,
          text: newLine as IText[],
          id: uuid(),
          customStyle,
        });

        return acc;
      }, []);

      return contentToAdd;
    },
    [findChildOptions]
  );

  const pasteList = useCallback(
    ({ block }: { block: ChildNode | null }) => {
      const isUl = block?.nodeName === "UL";

      const children = Array.from(block?.childNodes ?? []);

      if (isUl) {
        const isTodo = ["[ ]", "[x]"].some(
          (opt) => block?.firstChild.textContent.includes(opt)
        );

        if (isTodo) {
          return addBlock({
            type: "tl",
            children,
          });
        }

        return addBlock({
          type: "bl",
          children,
        });
      }

      // only can be a ol
      return addBlock({
        type: "nl",
        children,
      });
    },
    [addBlock]
  );

  const pasteText = useCallback(
    ({
      child,
      isOnlyOneLine,
    }: {
      child: ChildNode;
      isOnlyOneLine: boolean;
    }): LineOrText => {
      // returns a line
      if (isOnlyOneLine) {
        return {
          value: child.textContent ?? "",
          id: uuid(),
          options: [],
        };
      }

      return {
        id: uuid(),
        type: "p",
        text: [
          {
            value: child.textContent ?? "",
            id: uuid(),
            options: [],
          },
        ],
      };
    },
    []
  );

  const pasteMultiLines = useCallback(
    ({
      oneChildrenAndIsCode,
      multiWords,
      child,
    }: {
      oneChildrenAndIsCode: boolean;
      multiWords: LineOrText[];
      child: ChildNode;
    }): IWritterContent => {
      if (oneChildrenAndIsCode) {
        const newText = multiWords.reduce(
          (acc, item) =>
            "value" in item
              ? [
                  ...acc,
                  {
                    type: "p",
                    id: uuid(),
                    text: [
                      {
                        value: item.value,
                        id: item.id,
                        options: item.options,
                      },
                    ],
                  },
                ]
              : acc,
          []
        ) as unknown as IWritterContent;

        return newText;
      }

      let type = child.nodeName?.toLowerCase?.() ?? "p";
      if (!["p", "h1", "h2", "h3"].includes(type)) {
        type = "p";
      }

      const newLine = {
        id: uuid(),
        type: type as scribereActions,
        text: multiWords,
      } as IWritterContent;

      return newLine;
    },
    []
  );

  const pasteBlocks = useCallback(
    ({
      isOnlyOneLine,
      oneChildrenAndIsCode,
      children,
    }: {
      isOnlyOneLine: boolean;
      oneChildrenAndIsCode: boolean;
      children: ChildNode[];
    }) => {
      const newText = children.reduce<LineOrText[]>((acc, child) => {
        // if the child is a comment, do nothing
        if (child.nodeName === "#comment") return acc;

        // if is an \n, do nothing
        if (child.nodeName === "#text" && child.textContent?.includes("\n")) {
          return acc;
        }

        const isUlOrOl = child.nodeName === "UL" || child.nodeName === "OL";

        // if is a list, add the list
        if (isUlOrOl) {
          const blocks = pasteList({ block: child });
          acc.push(...blocks);

          return acc;
        }

        // if is only a text
        if (child.nodeName === "#text") {
          const text = pasteText({
            child,
            isOnlyOneLine,
          });
          acc.push(text);

          return acc;
        }

        const multiWords = findChildOptions(child, [], []);

        if (multiWords.length === 0) return acc;

        // only one line and is code
        if (isOnlyOneLine) {
          acc.push(...multiWords);
          return acc;
        }

        const lines = pasteMultiLines({
          oneChildrenAndIsCode,
          multiWords,
          child,
        });

        acc.push(lines);

        return acc;
      }, []);

      return newText;
    },
    [findChildOptions, pasteList, pasteMultiLines, pasteText]
  );

  return { pasteBlocks };
}

export default usePasteBlocks;

import { memo, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Code, atomOneLight, dracula } from "react-code-blocks";
import { useTriggerState } from "react-trigger-state";
import { useContextName } from "../../context/WriterContext";
import { IDecoration } from "../../interface";
import { DCode } from "./style";
import { useGTTranslate } from "@geavila/gt-design";

const STYLE_MAP = {
  bold: {
    fontWeight: "bold",
  },
  italic: {
    fontStyle: "italic",
  },
  underline: {
    borderBottom: "0.1rem solid var(--contrast)",
  },
  strikethrough: {
    textDecoration: "line-through",
  },
  code: {
    borderRadius: "0.2rem",
  },
  highlight: {
    borderRadius: "0.2rem",
    padding: "0.1rem 0.25rem",
    backgroundColor: "var(--highlight)",
    color: "var(--highlightText)",
  },
};

const Decoration = memo(
  ({
    options = [],
    value,
    id,
    parentText,
    info,
    onlyOneBlockAndIsEmpty,
  }: IDecoration) => {
    const tagRef = useRef<HTMLDivElement>(null);
    const name = useContextName();
    const [currTheme] = useTriggerState({ name: "curr_theme" });

    const [decoration] = useTriggerState({
      name: `${name}_decoration-${id}`,
    });

    const style = useMemo(
      () =>
        options.reduce((acc, item) => {
          acc = {
            ...acc,
            ...STYLE_MAP[item],
          };

          return acc;
        }, {}),
      [options]
    );

    useLayoutEffect(() => {
      if (info.current.blockId !== id) return;

      const selection = window.getSelection();

      const range = document.createRange();

      let cursorPositionValue = info.current.selection;

      let node = tagRef.current.childNodes[0];

      // if there's a code option, the node is another element
      if (options.includes("code") && node) {
        const codeNodes =
          tagRef.current.childNodes[0]?.childNodes[0]?.childNodes;

        if (!codeNodes) return;

        const codeNodesArray = Array.from(codeNodes);

        let nodeIndex = 0;
        let nodePosition = 0;
        let hasFound = false;

        node = codeNodesArray.find((item) => {
          const letters = item.textContent?.split("") ?? [""];

          const hasCursor = letters.some((_letter, index) => {
            nodeIndex++;
            if (
              nodeIndex === cursorPositionValue ||
              cursorPositionValue === 0
            ) {
              nodePosition = index;
              hasFound = true;
              return true;
            }
          });

          return hasCursor;
        })?.childNodes[0];

        if (!hasFound) {
          node = codeNodesArray[codeNodesArray.length - 1]?.childNodes[0];
        }
        cursorPositionValue = cursorPositionValue === 0 ? 0 : nodePosition + 1;
      }

      if (node == null || info.current.selection === -1) {
        node = tagRef.current;
      }

      console.log(node);

      if (onlyOneBlockAndIsEmpty) {
        info.current.selection = 0;
        cursorPositionValue = 0;
      }

      // if the cursorPositionValue is greater than the length of the text
      // return the cursor to the end of the text
      if (cursorPositionValue > value.length) {
        cursorPositionValue = value.length;
      }

      range.setStart(node, cursorPositionValue);
      range.setEnd(node, cursorPositionValue);

      selection.removeAllRanges();
      selection.addRange(range);
    }, [id, info, value, decoration, onlyOneBlockAndIsEmpty, options]);

    const [isHighlight, setIsHighlight] = useState({
      next: false,
      prev: false,
    });

    useLayoutEffect(() => {
      const nextSibling = tagRef.current.nextSibling;
      let nextIsHighlight = false;
      let prevIsHighlight = false;

      // @ts-expect-error - uh
      const nextId = nextSibling?.getAttribute("data-block-id");

      if (nextId != null) {
        const nextBlock = parentText.find((item) => item.id === nextId);

        nextIsHighlight =
          nextBlock?.options?.includes?.("highlight") ||
          nextBlock?.options?.includes?.("code");
      }

      const prevSibling = tagRef.current.previousSibling;

      // @ts-expect-error - uh
      const prevId = prevSibling?.getAttribute("data-block-id");

      if (prevId != null) {
        const prevBlock = parentText.find((item) => item.id === prevId);

        prevIsHighlight =
          prevBlock?.options?.includes?.("highlight") ||
          prevBlock?.options?.includes?.("code");
      }

      setIsHighlight({
        next: nextIsHighlight,
        prev: prevIsHighlight,
      });
    }, [parentText]);

    const { translateThis } = useGTTranslate();

    const tagOptions = {
      ref: tagRef,
      "data-block-id": id,
      placeholder: onlyOneBlockAndIsEmpty && translateThis("SCRIBERE.EMPTY"),
      className: onlyOneBlockAndIsEmpty && "placeholder",
      style: {
        ...style,
        ...(isHighlight.next && {
          borderTopRightRadius: "0px",
          borderBottomRightRadius: "0px",
          paddingRight: "0px",
        }),
        ...(isHighlight.prev && {
          borderTopLeftRadius: "0px",
          borderBottomLeftRadius: "0px",
          paddingLeft: "0px",
        }),
      },
    };

    if (options.includes("code") && value.length > 0) {
      return (
        <DCode {...tagOptions}>
          <Code
            // @ts-expect-error - uh
            text={value}
            language="javascript"
            theme={currTheme === "darkTheme" ? dracula : atomOneLight}
          />
        </DCode>
      );
    }

    return <span {...tagOptions}>{value || ""}</span>;
  }
);

Decoration.displayName = "Decoration";

export default Decoration;

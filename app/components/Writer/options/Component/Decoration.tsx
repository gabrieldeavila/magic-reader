import { memo, useLayoutEffect, useMemo, useRef } from "react";
import { IDecoration } from "../../interface";
import { useContextName } from "../../context/WriterContext";
import { useTriggerState } from "react-trigger-state";
import { Code, dracula } from "react-code-blocks";
import { DCode } from "./style";

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
  code: {},
};

const Decoration = memo(
  ({ options = [], value, id, info, onlyOneBlockAndIsEmpty }: IDecoration) => {
    const tagRef = useRef<HTMLDivElement>(null);
    const name = useContextName();

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
      if (options.includes("code")) {
        const codeNodes = tagRef.current.childNodes[0].childNodes[0].childNodes;
        const codeNodesArray = Array.from(codeNodes);

        let nodeIndex = 0;
        let nodePosition = 0;
        console.log(cursorPositionValue);

        node = codeNodesArray.find((item) => {
          const letters = item.textContent?.split("") ?? [""];

          const hasCursor = letters.some((_letter, index) => {
            nodeIndex++;
            if (nodeIndex === cursorPositionValue) {
              nodePosition = index;
              return true;
            }
          });

          return hasCursor;
        })?.childNodes[0];

        cursorPositionValue = nodePosition + 1;

        console.log(node, cursorPositionValue);
      }

      if (
        (node == null || info.current.selection === -1) &&
        onlyOneBlockAndIsEmpty === false
      ) {
        return;
      }

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

    const tagOptions = {
      ref: tagRef,
      "data-block-id": id,
      style,
    };

    if (options.includes("code")) {
      return (
        <DCode {...tagOptions}>
          <Code
            {...tagOptions}
            // @ts-expect-error - uh
            text={value || " "}
            language="javascript"
            theme={dracula}
          />
        </DCode>
      );
    }

    return <span {...tagOptions}>{value || " "}</span>;
  }
);

Decoration.displayName = "Decoration";

export default Decoration;

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
  code: {
  },
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

      const node = tagRef.current.childNodes[0];

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
    }, [id, info, value, decoration, onlyOneBlockAndIsEmpty]);

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

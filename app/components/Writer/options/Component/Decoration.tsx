import { memo, useLayoutEffect, useMemo, useRef } from "react";
import { IDecoration } from "../../interface";
import { useContextName } from "../../context/WriterContext";
import { useTriggerState } from "react-trigger-state";

const STYLE_MAP = {
  bold: {
    fontWeight: "bold",
  },
  italic: {
    fontStyle: "italic",
  },
  underline: {
    textDecoration: "underline",
  },
  strikethrough: {
    textDecoration: "line-through",
  },
  code: {
    fontFamily: "monospace",
  },
};

const Decoration = memo(({ options = [], value, id, info }: IDecoration) => {
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

  const Tag = useMemo(() => {
    if (options.includes("code")) return "code";

    return "span";
  }, [options]);

  useLayoutEffect(() => {
    if (info.current.blockId !== id) return;

    const selection = window.getSelection();

    const range = document.createRange();

    const cursorPositionValue = info.current.selection;

    const node = tagRef.current.childNodes[0];

    if (node == null || info.current.selection === -1) {
      return;
    }

    range.setStart(node, cursorPositionValue);
    range.setEnd(node, cursorPositionValue);

    selection.removeAllRanges();
    selection.addRange(range);
  }, [id, info, value, decoration]);

  return (
    <Tag ref={tagRef} data-block-id={id} style={style}>
      {value}
    </Tag>
  );
});

Decoration.displayName = "Decoration";

export default Decoration;

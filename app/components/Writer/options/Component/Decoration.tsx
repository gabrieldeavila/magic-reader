import {
  memo,
  useLayoutEffect,
  useMemo,
  useRef
} from "react";
import { IDecoration } from "../../interface";

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
    console.log(tagRef.current.childNodes[0], cursorPositionValue);

    range.setStart(tagRef.current.childNodes[0], cursorPositionValue);
    range.setEnd(tagRef.current.childNodes[0], cursorPositionValue);

    selection.removeAllRanges();
    selection.addRange(range);
  }, [id, info, value]);

  return (
    <Tag ref={tagRef} data-block-id={id} style={style}>
      {value}
    </Tag>
  );
});

Decoration.displayName = "Decoration";

export default Decoration;

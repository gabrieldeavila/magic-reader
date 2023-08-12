import React, { useMemo } from "react";
import { IText } from "../../interface";

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

function Decoration({ options = [], value }: IText) {
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

    // returns a fragment
    if (!options.length) return React.Fragment;

    return "span";
  }, [options]);

  return (
    <Tag onKeyUpCapture={() => console.log("o")} style={style}>
      {value}
    </Tag>
  );
}

export default Decoration;

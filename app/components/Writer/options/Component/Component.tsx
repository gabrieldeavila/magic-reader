"use client";

import { useCallback, useRef } from "react";
import { IEditable } from "../../interface";
import { Editable } from "../../style";
import useEditable from "../../utils/useEditable";
import { useWriterContext } from "../../context/WriterContext";

function Component({ text, ...props }: IEditable) {
  const ref = useRef<HTMLDivElement>(null);
  const { handleUpdate } = useWriterContext();

  useEditable({ text, ...props, ref });

  const handleBlur = useCallback(() => {
    handleUpdate(props.position, ref.current?.innerHTML);
  }, [handleUpdate, props.position]);

  return (
    <Editable ref={ref} onBlur={handleBlur} contentEditable>
      {text}
    </Editable>
  );
}

export default Component;

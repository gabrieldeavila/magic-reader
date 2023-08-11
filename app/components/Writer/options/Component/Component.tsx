"use client";

import { useCallback, useRef } from "react";
import { globalState } from "react-trigger-state";
import { useWriterContext } from "../../context/WriterContext";
import { IEditable, InputEvent } from "../../interface";
import { Editable } from "../../style";
import useEditable from "../../utils/useEditable";
import useSetRange from "../../utils/useSetRange";
import Decoration from "./Decoration";

function Component({ text, ...props }: IEditable) {
  const ref = useRef<HTMLDivElement>(null);
  // const { handleUpdate } = useWriterContext();

  // const { setRange } = useSetRange({ text, ref, ...props });

  // const handleChange = useCallback(
  //   (event: InputEvent) => {
  //     // only accept letters, numbers, spaces and special characters
  //     const allowedChars = /^[a-zA-Z0-9\s~`!@#$%^&*()_+={}[\]:;"'<>,.?/\\|-]+$/;

  //     const inputChar = event.key;

  //     const isAllowed = allowedChars.test(inputChar) && event.key.length === 1;

  //     if (!isAllowed) return;

  //     const cursorPosition = window.getSelection()?.anchorOffset;
  //     globalState.set("cursorPosition", cursorPosition);

  //     // removes &nbsp;
  //     const newText = String(ref.current?.innerHTML).replace(
  //       /&nbsp;/g,
  //       "\u00A0"
  //     );

  //     handleUpdate(props.position, newText);
  //     setRange();
  //   },
  //   [handleUpdate, props.position, setRange]
  // );

  // useEditable({ text, ...props, ref });

  return (
    <Editable
      ref={ref}
      // onKeyUp={handleChange}
      contentEditable
      suppressContentEditableWarning
    >
      {text.map((item, index) => {
        return <Decoration {...item} key={index} />;
      })}
    </Editable>
  );
}

export default Component;

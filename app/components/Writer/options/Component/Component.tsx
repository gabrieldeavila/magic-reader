"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { IEditable } from "../../interface";
import { Editable } from "../../style";
import Decoration from "./Decoration";

function Component({ text, ...props }: IEditable) {
  const ref = useRef<HTMLDivElement>(null);
  // const { handleUpdate } = useWriterContext();

  // const { setRange } = useSetRange({ text, ref, ...props });

  // useEditable({ text, ...props, ref });
  const mimic = useMemo(
    () =>
      text.reduce((acc, item) => {
        const words = item.value.split("");

        console.log(words);

        words.forEach((word) => {
          acc.push({
            letter: word,
            id: item.id,
          });
        });

        return acc;
      }, []),
    [text]
  );

  const handleChange = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      // only accept letters, numbers, spaces and special characters
      const allowedChars = /^[a-zA-Z0-9\s~`!@#$%^&*()_+={}[\]:;"'<>,.?/\\|-]+$/;

      const inputChar = event.key;

      const isAllowed = allowedChars.test(inputChar) && event.key.length === 1;

      if (!isAllowed) {
        // prevents, if enter
        if (event.key === "Enter") {
          event.preventDefault();
        }
        return;
      }

      // const positionToAdd = 

      console.log("uh");
    },
    []
  );

  useEffect(() => {
    console.log(text, mimic);
  }, [mimic, text]);

  // const handleChange = useCallback((e) => {
  //   console.log(e);
  // }, []);

  return (
    <Editable
      ref={ref}
      onKeyDown={handleChange}
      // onKeyDown={(e)=>console.log(e)}
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

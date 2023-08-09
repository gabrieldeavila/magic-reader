"use client";

import { useRef } from "react";
import { IEditable } from "../../interface";
import { Editable } from "../../style";
import useEditable from "../../utils/useEditable";

function p({ text, ...props }: IEditable) {
  const ref = useRef<HTMLDivElement>(null);

  useEditable({ text, ...props, ref });

  return <Editable ref={ref} contentEditable>{text}</Editable>;
}

export default p;

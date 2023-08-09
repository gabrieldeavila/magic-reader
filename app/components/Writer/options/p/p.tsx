import React from "react";
import { IWritterContent } from "../../interface";

function p({ text }: IWritterContent) {
  return <div contentEditable>{text}</div>;
}

export default p;

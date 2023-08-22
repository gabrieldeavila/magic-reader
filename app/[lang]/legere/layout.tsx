"use client";

import React from "react";
import Nav from "../../components/Nav/Nav";
import { Space } from "@geavila/gt-design";

function layout({ children }) {
  return (
    <>
      <Nav logo="DL" />
      {/* @ts-expect-error - uh*/}
      <Space.Modifiers pt="3.25rem">{children}</Space.Modifiers>
    </>
  );
}
export default layout;

"use client";

import React from "react";
import Nav from "../../components/Nav/Nav";
import { Space } from "@geavila/gt-design";

function layout({ children }) {
  return (
    <>
      <Nav logo="DL" />
      <Space.Main>{children}</Space.Main>
    </>
  );
}
export default layout;

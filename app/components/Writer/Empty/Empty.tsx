import React from "react";
import { EmptySt } from "./style";
import Logo from "../navbar/logo";

function Empty() {
  return (
    <EmptySt.Wrapper>
      <EmptySt.Content>
        <Logo width="20dvw" />
      </EmptySt.Content>
    </EmptySt.Wrapper>
  );
}

export default Empty;

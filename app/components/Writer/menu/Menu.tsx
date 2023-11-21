import React from "react";
import MenuSt from "./style";
import { useDivider } from "../divider/Divider";

function Menu() {
  const { Divider, dividerContainerRef } = useDivider();

  return (
    <MenuSt.Wrapper ref={dividerContainerRef}>
      Menu
      <Divider />
    </MenuSt.Wrapper>
  );
}

export default Menu;

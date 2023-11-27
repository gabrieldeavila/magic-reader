import React from "react";
import MenuSt from "./style";
import { useDivider } from "../divider/Divider";

function Menu() {
  const { Divider, dividerContainerRef } = useDivider();

  return (
    <MenuSt.Wrapper ref={dividerContainerRef}>
      <MenuSt.Container>
        <MenuSt.Title.Content>
          <MenuSt.Title.Name>Explorer</MenuSt.Title.Name>
        </MenuSt.Title.Content>
      </MenuSt.Container>
      {Divider}
    </MenuSt.Wrapper>
  );
}

export default Menu;

import React, { useMemo } from "react";
import MenuSt from "./style";
import { useDivider } from "../divider/Divider";
import { useTriggerState } from "react-trigger-state";
import Explorer from "./Explorer/Explorer";

const options = {
  explorer: Explorer,
};

function Menu() {
  const { Divider, dividerContainerRef } = useDivider();

  const [currMenu] = useTriggerState({
    name: "curr_menu",
    initial: "explorer",
  });

  const Component = useMemo(() => options[currMenu], [currMenu]);

  return (
    <MenuSt.Wrapper ref={dividerContainerRef}>
      <MenuSt.Container>
        <Component />
      </MenuSt.Container>
      {Divider}
    </MenuSt.Wrapper>
  ); 
}

export default Menu;

import React, { useCallback, useMemo } from "react";
import MenuSt from "./style";
import { useDivider } from "../divider/Divider";
import { stateStorage, useTriggerState } from "react-trigger-state";
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

  const handleContextMenu = useCallback((e) => {
    e.preventDefault();
    const x = e.clientX;
    const y = e.clientY;

    stateStorage.set("show_context_menu", {
      x,
      y,
    });
  }, []);

  return (
    <MenuSt.Wrapper ref={dividerContainerRef}>
      <MenuSt.Container onContextMenu={handleContextMenu}>
        <Component />
      </MenuSt.Container>
      {Divider}
    </MenuSt.Wrapper>
  );
}

export default Menu;

"use client";

import { useCallback, useEffect } from "react";
import { File, Settings, User } from "react-feather";
import { useTriggerState } from "react-trigger-state";
import SidebarSt from "./style";

function Sidebar() {
  const [menu, setMenu] = useTriggerState({ name: "menu", initial: localStorage.getItem("menu") || "" });

  const handleClickFile = useCallback(() => {
    setMenu((prev: string) => {
      if (prev === "file") return "";
      return "file";
    });
  }, [setMenu]);

  useEffect(() => {
    localStorage.setItem("menu", menu);
  }, [menu]);

  return (
    <SidebarSt.Wrapper>
      <SidebarSt.Content>
        <SidebarSt.Group>
          <SidebarSt.Item active={menu === "file"} onClick={handleClickFile}>
            <File />
          </SidebarSt.Item>
        </SidebarSt.Group>
        <SidebarSt.Group>
          <SidebarSt.Item>
            <User />
          </SidebarSt.Item>
          <SidebarSt.Item>
            <Settings />
          </SidebarSt.Item>
        </SidebarSt.Group>
      </SidebarSt.Content>
    </SidebarSt.Wrapper>
  );
}

export default Sidebar;

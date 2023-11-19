"use client";

import React from "react";
import SidebarSt from "./style";
import { File, User } from "react-feather";

function Sidebar() {
  return (
    <SidebarSt.Wrapper>
      <SidebarSt.Content>
        <SidebarSt.Item active={true}>
          <File />
        </SidebarSt.Item>
        <SidebarSt.Item>
          <User />
        </SidebarSt.Item>
      </SidebarSt.Content>
    </SidebarSt.Wrapper>
  );
}

export default Sidebar;

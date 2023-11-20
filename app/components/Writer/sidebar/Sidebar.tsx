"use client";

import React from "react";
import SidebarSt from "./style";
import { File, Settings, User } from "react-feather";

function Sidebar() {
  return (
    <SidebarSt.Wrapper>
      <SidebarSt.Content>
        <SidebarSt.Group>
          <SidebarSt.Item>
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

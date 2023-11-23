import React from "react";
import { NavbarSt } from "./style";
import Logo from "./logo";

function Navbar() {
  return (
    <NavbarSt.Wrapper>
      <NavbarSt.Content>
        <NavbarSt.Img>
          <Logo />
        </NavbarSt.Img>
      </NavbarSt.Content>
    </NavbarSt.Wrapper>
  );
}

export default Navbar;

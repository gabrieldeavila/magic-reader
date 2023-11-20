import React from "react";
import { NavbarSt } from "./style";
import Image from "next/image";

function Navbar() {
  return (
    <NavbarSt.Wrapper>
      <NavbarSt.Content>
        <Image
          src="https://raw.githubusercontent.com/gabrieldeavila/magic-reader/9f4e0920dc71f978ee8b9ddf839228f7c184834d/public/logo.svg"
          alt="Dissolutus"
          width={24}
          height={24}
        />
      </NavbarSt.Content>
    </NavbarSt.Wrapper>
  );
}

export default Navbar;

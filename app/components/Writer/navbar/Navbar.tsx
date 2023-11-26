import Hat from "./hat";
import { NavbarSt } from "./style";

function Navbar() {
  return (
    <NavbarSt.Wrapper>
      <NavbarSt.Content>
        <NavbarSt.Img>
          <Hat />
        </NavbarSt.Img>
      </NavbarSt.Content>
    </NavbarSt.Wrapper>
  );
}

export default Navbar;

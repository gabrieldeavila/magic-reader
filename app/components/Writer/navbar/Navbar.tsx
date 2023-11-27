import Hat from "./hat";
import { NavbarSt } from "./style";

function Navbar() {
  return (
    <NavbarSt.Wrapper>
      <NavbarSt.Content>
        <NavbarSt.Img>
          <Hat />
        </NavbarSt.Img>
        <NavbarSt.Options>
          <NavbarSt.Option>
            <NavbarSt.OptionText>File</NavbarSt.OptionText>
          </NavbarSt.Option>
          <NavbarSt.Option>
            <NavbarSt.OptionText>Edit</NavbarSt.OptionText>
          </NavbarSt.Option>
          <NavbarSt.Option>
            <NavbarSt.OptionText>Selection</NavbarSt.OptionText>
          </NavbarSt.Option>
        </NavbarSt.Options>
      </NavbarSt.Content>
    </NavbarSt.Wrapper>
  );
}

export default Navbar;

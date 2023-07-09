import { GTNavbar, Navbar } from "@geavila/gt-design";

function Nav() {
  return (
    <GTNavbar>
      <Navbar.Left>
        <Navbar.Title>Reader</Navbar.Title>
        {/* <GTNavbarOptions>
            <GTNavbarOption
              onClick={handleClick}
              name="Home"
              icon={<Icon.Home />}
            />
            <GTNavbarOption
              onClick={handleClick}
              name="Projects"
              icon={<Icon.Book />}
            />
            <GTNavbarOption
              onClick={handleClick}
              name="About"
              icon={<Icon.Info />}
            />
          </GTNavbarOptions> */}
      </Navbar.Left>

      <Navbar.Right>
        <Navbar.Options>
          <Navbar.OptionWrapper>
            {/* <GTSymbolPopup alt="GT DESIGN">
                <Popup.Container>
                  <Popup.Item>
                    <Text.P>nothing here!</Text.P>
                  </Popup.Item>
                </Popup.Container>
              </GTSymbolPopup> */}
          </Navbar.OptionWrapper>
        </Navbar.Options>
      </Navbar.Right>
    </GTNavbar>
  );
}

export default Nav;

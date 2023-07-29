'use client'

import {
  GTNavbar,
  Navbar,
  Space,
  Text,
  useGTTranslate,
  useIsMobile
} from "@geavila/gt-design";
import { useCallback, useState } from "react";

function Nav({ logo }: { logo: string }) {
  const { translateThis } = useGTTranslate();
  const isMobile = useIsMobile();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [tempShowMobileMenu, setTempShowMobileMenu] = useState(false);

  const handleOpenMobile = useCallback(() => {
    setShowMobileMenu(true);
    setTempShowMobileMenu(true);
  }, []);

  const handleCloseMobile = useCallback(() => {
    setTempShowMobileMenu(false);
    setTimeout(() => {
      setShowMobileMenu(false);
    }, 300);
  }, []);

  return (
    <>
      <GTNavbar>
        <Space.Center>
          {/* @ts-ignore */}
          <Space.Modifiers width="1248px" justifyContent="space-between">
            <Navbar.Left>
              <Navbar.Logo>{logo}</Navbar.Logo>
            </Navbar.Left>

            {!isMobile ? (
              <Navbar.Right>
                {
                  <Navbar.Options>
                    <Navbar.OptionWrapper>
                      {/* @ts-ignore */}
                      <Space.Modifiers gridGap="1rem">
                        {/* {options.map((option, index) => (
                          <Text.Action onClick={option.onClick} key={index}>
                            {translateThis(option.description)}
                          </Text.Action>
                        ))} */}
                      </Space.Modifiers>
                    </Navbar.OptionWrapper>

                    <Navbar.OptionWrapper>
                      {/* @ts-ignore */}
                      <Space.Modifiers gridGap="1rem">
                      </Space.Modifiers>
                    </Navbar.OptionWrapper>
                  </Navbar.Options>
                }
              </Navbar.Right>
            ) : (
              <Navbar.Right>
                {/* <Menu onClick={handleOpenMobile} className="navbar-menu" /> */}
              </Navbar.Right>
            )}
          </Space.Modifiers>
        </Space.Center>
      </GTNavbar>

      {showMobileMenu && (
        <Navbar.Mobile.Wrapper isOpen={tempShowMobileMenu}>
          <Space.Modifiers
            //  @ts-ignore
            mb="1rem"
            pl="0.2rem"
            justifyContent="space-between"
            alignItems="center"
          >
            {/* @ts-ignore */}
            <Text.Title mb="0" fontSize="1.2rem !important">
              {logo}
            </Text.Title>

            {/* <X onClick={handleCloseMobile} className="navbar-x" /> */}
          </Space.Modifiers>
          {/* @ts-ignore */}
          <Space.Modifiers flexDirection="column" gridGap="1rem">
          </Space.Modifiers>
          {/*  @ts-ignore */}
          <Space.Modifiers pt="2rem">
          </Space.Modifiers>
        </Navbar.Mobile.Wrapper>
      )}
    </>
  );
}

export default Nav;

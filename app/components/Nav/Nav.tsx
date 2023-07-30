"use client";

import {
  GTNavbar,
  Navbar,
  Space,
  Text,
  useGTTranslate,
  useIsMobile,
} from "@geavila/gt-design";
import { useCallback, useState } from "react";
import { Menu, MoreHorizontal, X } from "react-feather";
import { stateStorage } from "react-trigger-state";

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

  const handleSettings = useCallback(() => {
    stateStorage.set("show_modal_reader", true);
  }, []);

  return (
    <>
      <GTNavbar>
        {/* @ts-ignore */}
        <Space.Center>
          <Space.Modifiers
            //  @ts-ignore
            justifyContent="space-between"
            width="-webkit-fill-available"
          >
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
                        <MoreHorizontal
                          onClick={handleSettings}
                          cursor="pointer"
                        />
                      </Space.Modifiers>
                    </Navbar.OptionWrapper>

                    <Navbar.OptionWrapper>
                      {/* @ts-ignore */}
                      <Space.Modifiers gridGap="1rem"></Space.Modifiers>
                    </Navbar.OptionWrapper>
                  </Navbar.Options>
                }
              </Navbar.Right>
            ) : (
              <Navbar.Right>
                <Menu onClick={handleOpenMobile} className="navbar-menu" />
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

            <X onClick={handleCloseMobile} className="navbar-x" />
          </Space.Modifiers>
          <Space.Modifiers
            // @ts-expect-error
            flexDirection="column"
            gridGap="1rem"
          ></Space.Modifiers>
          {/*  @ts-ignore */}
          <Space.Modifiers pt="2rem"></Space.Modifiers>
        </Navbar.Mobile.Wrapper>
      )}
    </>
  );
}

export default Nav;

"use client";

import { GTNavbar, Navbar, Space, Text, useIsMobile } from "@geavila/gt-design";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { Info, Menu, X } from "react-feather";
import { stateStorage } from "react-trigger-state";

function Nav({ logo }: { logo: string }) {
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

  const router = useRouter();

  const handleGoBack = useCallback(() => {
    const lang = stateStorage.get("lang");
    console.log("aa");
    router.push(`/${lang}/legere`);
  }, [router]);

  return (
    <>
      <GTNavbar>
        <Space.Center>
          <Space.Modifiers
            //  @ts-expect-error - uh
            justifyContent="space-between"
            width="-webkit-fill-available"
          >
            <Navbar.Left>
              <Navbar.Logo
                style={{
                  cursor: "pointer",
                }}
                onClick={handleGoBack}
              >
                {logo}
              </Navbar.Logo>
            </Navbar.Left>

            {!isMobile ? (
              <Navbar.Right>
                {
                  <Navbar.Options>
                    <Navbar.OptionWrapper>
                      {/* @ts-expect-error - uh */}
                      <Space.Modifiers gridGap="1rem">
                        <button
                          onClick={handleSettings}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                          }}
                        >
                          <Info size="1rem" cursor="pointer" />
                        </button>
                      </Space.Modifiers>
                    </Navbar.OptionWrapper>

                    <Navbar.OptionWrapper>
                      {/* @ts-expect-error - uh */}
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
            //  @ts-expect-error - uh
            mb="1rem"
            pl="0.2rem"
            justifyContent="space-between"
            alignItems="center"
          >
            {/* @ts-expect-error - uh */}
            <Text.Title mb="0" fontSize="1.2rem !important">
              {logo}
            </Text.Title>

            <X onClick={handleCloseMobile} className="navbar-x" />
          </Space.Modifiers>
          <Space.Modifiers
            // @ts-expect-error - do later
            flexDirection="column"
            gridGap="1rem"
          ></Space.Modifiers>
          {/*  @ts-expect-error - uh */}
          <Space.Modifiers pt="2rem"></Space.Modifiers>
        </Navbar.Mobile.Wrapper>
      )}
    </>
  );
}

export default Nav;

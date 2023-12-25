import { scrolls, shadows } from "@geavila/gt-design";
import styled from "styled-components";

const MenuTitleOptions = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  opacity: 0;
  padding-right: 0.5rem;
`;

const MenuWrapper = styled.div`
  display: flex;
  position: relative;
  padding: 0.5rem;
  padding-right: 0;
  min-width: 200px;
  max-width: 90%;
  background: var(--menu);
  user-select: none;
  z-index: 2;

  ${shadows.simple};
  ${scrolls.default};

  &:hover ${MenuTitleOptions} {
    opacity: 1;
  }
`;

const MenuContainer = styled.div`
  padding: 0.5rem;
  padding-right: 0;
  padding-top: 0;
  width: -webkit-fill-available;
  width: -moz-available;
`;

const MenuTitleContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const MenuTitleName = styled.h3`
  font-size: 0.75rem;
  font-weight: 200;
  text-transform: uppercase;
`;

const MenuTitleOption = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem;
  border-radius: 5px;
  cursor: pointer;

  &:hover {
    background: var(--contrast-0_9);
  }
`;

const MenuOverflow = styled.div`
  height: calc(100% - 1rem);
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 1rem;

  ${scrolls.default};

  &:hover {
    overflow-y: auto;
    &::-webkit-scrollbar-thumb {
      border-radius: 2px;
    }
  }

  /* change the scroll width */
  &::-webkit-scrollbar {
    width: 0.2rem;
  }

  /* change the scrollbar color */
  &::-webkit-scrollbar-track {
    background: transparent;
  }
`;

const MenuSt = {
  Wrapper: MenuWrapper,
  Container: MenuContainer,
  Overflow: MenuOverflow,
  Title: {
    Content: MenuTitleContent,
    Name: MenuTitleName,
    Options: MenuTitleOptions,
    Option: MenuTitleOption,
  },
};

export default MenuSt;

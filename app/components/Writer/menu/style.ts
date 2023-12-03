import { scrolls, shadows } from "@geavila/gt-design";
import styled from "styled-components";

const MenuTitleOptions = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  opacity: 0;


`;
const MenuWrapper = styled.div`
  display: flex;
  position: relative;
  padding: 0.5rem;
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
  padding-top: 0;
  width: 100%;
`;

const MenuTitleContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const MenuTitleName = styled.h3`
  font-size: 0.75rem;
  font-weight: 100;
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

const MenuSt = {
  Wrapper: MenuWrapper,
  Container: MenuContainer,
  Title: {
    Content: MenuTitleContent,
    Name: MenuTitleName,
    Options: MenuTitleOptions,
    Option: MenuTitleOption,
  },
};

export default MenuSt;

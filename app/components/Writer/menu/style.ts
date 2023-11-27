import { scrolls, shadows } from "@geavila/gt-design";
import styled from "styled-components";

const MenuWrapper = styled.div`
  display: flex;
  position: relative;
  padding: 0.5rem;
  min-width: 200px;
  max-width: 90%;
  background: var(--menu);
  user-select: none;
  z-index: 2;

  ${shadows.simple}
  ${scrolls.default}
`;

const MenuContainer = styled.div`
  padding: 0.5rem;
  padding-top: 0;
  width: 100%;
`;

const MenuTitleContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const MenuTitleName = styled.h3`
  font-size: 0.75rem;
  font-weight: 100;
  text-transform: uppercase;
`;

const MenuSt = {
  Wrapper: MenuWrapper,
  Container: MenuContainer,
  Title: {
    Content: MenuTitleContent,
    Name: MenuTitleName,
  },
};

export default MenuSt;

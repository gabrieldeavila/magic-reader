import { shadows } from "@geavila/gt-design";
import styled from "styled-components";

const Wrapper = styled.div`
  background: var(--secondary);
  position: fixed;
  z-index: 2;
  height: 1.75rem;
  left: 0;
  right: 0;

  ${shadows.simple}
`;

const Content = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 0.5rem;
  height: 100%;
`;

export const NavbarSt = {
  Wrapper,
  Content
};

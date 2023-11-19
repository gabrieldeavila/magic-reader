import { shadows } from "@geavila/gt-design";
import styled from "styled-components";

const Wrapper = styled.div`
  background: var(--secondary);
  width: 3rem;
  position: fixed;
  left: 0;
  top: 1.75rem;
  bottom: 0;
  z-index: 1;
  ${shadows.simple}
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: -webkit-fill-available;
`;

const Item = styled.div<{ active?: boolean }>`
  cursor: pointer;
  width: -webkit-fill-available;
  padding: 0.5rem 0;
  border-left: 2px solid
    ${({ active }) => (active ? "var(--info)" : "transparent")};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: 0.2s;
`;

const SidebarSt = {
  Wrapper,
  Content,
  Item,
};

export default SidebarSt;

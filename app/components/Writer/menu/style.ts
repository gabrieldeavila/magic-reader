import { scrolls, shadows } from "@geavila/gt-design";
import styled from "styled-components";

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  position: relative;
  padding: 0.5rem;
  min-width: 200px;
  max-width: 90%;
  background: var(--containerMain);
  user-select: none;

  ${shadows.simple}
  ${scrolls.default}
`;

const MenuSt = {
  Wrapper,
};

export default MenuSt;

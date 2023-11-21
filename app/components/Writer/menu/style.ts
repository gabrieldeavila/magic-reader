import { scrolls, shadows } from "@geavila/gt-design";
import styled from "styled-components";

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  position: relative;
  padding: 0.5rem;

  background: var(--containerMain);

  ${shadows.simple}
  ${scrolls.default}
`;

const MenuSt = {
  Wrapper,
};

export default MenuSt;

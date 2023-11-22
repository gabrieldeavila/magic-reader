import styled, { css } from "styled-components";

const activeCss = css`
  &::before {
    content: "";
    background: var(--moonColor);
  }
`;

const Wrapper = styled.div<{ active?: boolean }>`
  width: 0.5px;
  z-index: 999;
  position: absolute;
  top: 0;
  bottom: 0;
  height: 100%;
  cursor: col-resize;
  right: 0;
  background: transparent;
  opacity: 0.5;
  transition: 0.2s;

  &::before {
    content: "";
    transition: 0.2s;
    position: absolute;
    width: 5px;
    height: 100%;
    background: unset;
  }

  ${({ active }) => active && activeCss}
`;

const DividerSt = {
  Wrapper,
};

export default DividerSt;

import { shadows, transitions } from "@geavila/gt-design";
import styled from "styled-components";
import { PopupWrapperProps } from "./interface";

const PopupWrapper = styled.div<PopupWrapperProps>`
  position: absolute;
  top: ${({ isUp }) => (isUp ? "unset" : "40px")};
  bottom: ${({ isUp }) => (isUp ? "-40px" : "unset")};
  left: 0.5rem;
  z-index: 100;
  border-radius: 5px;

  overflow: hidden;

  ${shadows.basic}
`;

const PopupContent = styled.div`
  display: flex;
`;

const PopupItem = styled.div`
  cursor: pointer;
  display: flex;
  background: var(--primary);

  &:hover {
    background: var(--secondary);
  }

  * {
    user-select: none;
  }

  ${transitions.smooth}
`;

const Base = styled.button`
  /* resets */
  border: none;
  background: none;
  padding: 0.5rem;
  margin: 0;
  outline: none;
  cursor: pointer;
`;

const Bold = styled(Base)`
  font-weight: bold;
`;

const Italic = styled(Base)`
  font-style: italic;
`;

const Underline = styled(Base)`
  text-decoration: underline;
`;

const WPopup = {
  Wrapper: PopupWrapper,
  Content: PopupContent,
  Item: PopupItem,
  B: Bold,
  I: Italic,
  U: Underline,
};

export default WPopup;

// const Options

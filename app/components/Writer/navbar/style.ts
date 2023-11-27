import { shadows } from "@geavila/gt-design";
import styled from "styled-components";

const Wrapper = styled.div`
  background: var(--containerSecondary);
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
  gap: 0.5rem;
  padding: 0 0.5rem;
  height: 100%;
`;

const Img = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Options = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
`;

const Option = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 0.25rem;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: 0.25s ease-in-out;

  &:hover {
    background: var(--contrast-0_9);
  }
`;

const OptionText = styled.p`
  font-size: 0.8rem;
  font-weight: 100;
`;

export const NavbarSt = {
  Wrapper,
  Content,
  Img,
  Options,
  Option,
  OptionText,
};

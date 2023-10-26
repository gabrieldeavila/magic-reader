import { shadows } from "@geavila/gt-design";
import styled from "styled-components";

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-direction: row;
  padding: 0.5rem;
`;

const Selected = styled.p`
  color: var(--contrast);
  font-size: 0.8rem;
  user-select: none;
  font-weight: 200;
`;

const Options = styled.div`
  position: absolute;
  top: 110%;
  border-radius: 5px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  background: var(--primary);
  width: 8rem;
  padding: 0.5rem;
  ${shadows.basic};

  /* hides and shows it */
  ${({ show }: { show: boolean }) => `
    opacity: ${show ? 1 : 0};
    transform: ${show ? "scale(1) translateY(0)" : "scale(0.95) translateY(-1rem)"};
    pointer-events: ${show ? "all" : "none"};
  `}

  transition: 0.2s ease-in-out;
`;

const Info = styled.p`
  font-size: 0.7rem;
  font-weight: 400;
`;

const Option = styled.div`
  cursor: pointer;
  display: flex;
  font-size: 0.9rem;
  border-radius: 5px;
  background: var(--primary);
  transition: 0.2s ease-in-out;
  padding: 0 0.5rem;
  font-weight: 100;

  &:hover {
    background: var(--secondary);
  }

  &:active {
    transform: scale(0.95);
  }

  * {
    user-select: none;
  }
`;

export const Select = {
  Wrapper,
  Selected,
  Container,
  Options,
  Option,
  Info,
};

import { shadows } from "@geavila/gt-design";
import styled from "styled-components";

export const AlignWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0 0.5rem;
  align-items: center;
  width: 100%;
`;

export const AlignOptions = styled.div<{ isOutOfScreen: boolean; show: boolean }>`
  position: absolute;
  display: flex;
  gap: 0.5rem;
  align-items: center;

  padding: 0.5rem;
  background: var(--primary);

  flex-direction: column;
  border-radius: 5px;

  transition: 0.2s ease-in-out;

  ${({ isOutOfScreen }) => (isOutOfScreen ? "bottom: 110%" : "top: 110%")};

  ${({ show }) => `
    opacity: ${show ? 1 : 0};
    transform: ${
      show ? "scale(1) translateY(0)" : "scale(0.95) translateY(-1rem)"
    };
    pointer-events: ${show ? "all" : "none"};
  `}

  ${shadows.basic};
`;

export const AlignOption = styled.button`
  margin: 0;
  border: none;
  cursor: pointer;
  display: flex;
  font-size: 0.9rem;
  border-radius: 5px;
  background: var(--primary);
  transition: 0.2s ease-in-out;
  padding: 0 0.5rem;
  font-weight: 100;
  padding: 0.5rem;

  :disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  &:hover:not(:disabled) {
    background: var(--secondary);
  }

  &:active:not(:disabled) {
    transform: scale(0.95);
  }
`;

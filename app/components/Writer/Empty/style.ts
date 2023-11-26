import { shadows } from "@geavila/gt-design";
import styled from "styled-components";

const EmptyWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
`;

const EmptyContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  align-items: center;
  justify-content: center;
  opacity: 0.3;
  width: 100%;

  svg {
    max-width: 100%;
  }
`;

const EmptyTipWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  gap: 0.75rem;

  user-select: none;
`;

const EmptyTipContent = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: flex-start;
  justify-content: flex-start;
  width: 100%;
`;

const EmptyTipTitle = styled.p`
  font-weight: 200;
  padding: 0 0.5rem;
  text-align: right;
  width: 50%;
`;

const EmptyTipShortcut = styled.div`
  font-size: 1rem;
  display: flex;
  gap: 0.5rem;
`;

const EmptyTipKey = styled.span`
  background: var(--primary-0_1);
  border-radius: 5px;
  padding: 0.1rem 0.5rem;
  ${shadows.simple}
`;

export const EmptySt = {
  Wrapper: EmptyWrapper,
  Content: EmptyContent,
  Tip: {
    Wrapper: EmptyTipWrapper,
    Content: EmptyTipContent,
    Title: EmptyTipTitle,
    Shortcut: EmptyTipShortcut,
    Key: EmptyTipKey,
  },
};

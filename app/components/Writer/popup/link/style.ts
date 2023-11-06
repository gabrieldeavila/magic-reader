import { shadows } from "@geavila/gt-design";
import styled from "styled-components";

const LinkWrapper = styled.div`
  position: absolute;
  pointer-events: all;

  top: 110%;
  right: 0;
  transition: 0.2s ease-in-out;

  ${({ show }: { show: boolean }) => `
    opacity: ${show ? 1 : 0};
    transform: ${
      show ? "scale(1) translateY(0)" : "scale(0.95) translateY(-1rem)"
    };
    pointer-events: ${show ? "all" : "none"};
  `}
`;

const LinkContainer = styled.div`
  background: var(--primary);
  padding: 0.5rem;
  border-radius: 5px;
  display: flex;
  gap: 0.5rem;
  ${shadows.basic};
`;

const LinkInput = styled.input`
  background: var(--primary);
  border: none;
  padding: 0.25rem;
  border-radius: 5px;
  ${shadows.outline}
`;

const LinkApply = styled.button`
  background: var(--primary);
  border: none;
  border-radius: 5px;
  cursor: pointer;

  ${shadows.outline};

  transition: 0.2s ease-in-out;

  &:hover {
    background: var(--secondary);
  }

  &:active {
    transform: scale(0.95);
  }
`;

const LinkRemove = styled(LinkApply)`
  background: var(--error);

  &:hover {
    background: var(--buttonError2);
  }
`;

const LinkStyle = {
  Wrapper: LinkWrapper,
  Container: LinkContainer,
  Input: LinkInput,
  Apply: LinkApply,
  Remove: LinkRemove,
};

export default LinkStyle;

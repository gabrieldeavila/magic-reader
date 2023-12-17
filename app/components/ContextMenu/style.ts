import styled from "styled-components";

const Wrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
  background-color: var(--primary-0_2);
  backdrop-filter: blur(4px);
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  padding: 8px 0;
  min-width: 200px;
  max-height: 200px;
  overflow: auto;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0 8px;
`;

const Option = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 8px 16px;
  font-size: 0.75rem;
  color: var(--text);
  background-color: transparent;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  &:hover {
    background-color: var(--secondary);
  }

  &:active {
    transform: scale(0.95);
  }
`;

const OptionTitle = styled.span``;

const OptionShortcut = styled.span`
  margin-left: auto;
  color: var(--text-secondary);
`;

const ContextDivider = styled.div`
  width: 100%;
  height: 1px;
  background-color: var(--backgroundMobileNav);
  margin: 4px 0;
`;

const ContextMenuSt = {
  Container,
  Wrapper,
  Divider: ContextDivider,
  Option: {
    Wrapper: Option,
    Shortcut: OptionShortcut,
    Title: OptionTitle,
  },
};

export default ContextMenuSt;

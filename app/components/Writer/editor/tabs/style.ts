import { scrolls } from "@geavila/gt-design";
import Link from "next/link";
import styled, { css } from "styled-components";

const TabWrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  height: 100%;
  overflow: hidden;
  position: relative;
`;

const TabContent = styled.div`
  flex: 1;
  height: 100%;
  overflow: hidden;
  position: relative;
  background: var(--primary);
  display: flex;
  overflow: auto;
  ${scrolls.default};

  /* change the scroll height */
  &::-webkit-scrollbar {
    height: 0.5rem;
  }
`;

const TabOptionName = styled.p`
  user-select: none;
  font-size: 0.8rem;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 300;
`;

const TabOptionClose = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem;
  border-radius: 5px;
  opacity: 0;

  &:hover {
    background: var(--contrast-0_9);
  }
`;

const activeTab = css`
  background: var(--containerSecondary);
  border-top: 1px solid var(--googleBackground);
  border-bottom-color: transparent;

  ${TabOptionClose} {
    opacity: 1;
  }
`;

const TabOption = styled(Link)<{ active?: boolean }>`
  text-decoration: none;

  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 0 10px;
  height: 30px;
  font-weight: 200;
  border: 1px solid var(--tabBorder);
  border-top-color: transparent;
  cursor: pointer;

  &:hover ${TabOptionClose} {
    opacity: 1;
  }

  /* to odd */
  &:nth-child(odd):not(:last-child) {
    border-right: none;
  }

  &:nth-child(odd) {
    border-left: none;
  }

  &:hover {
    background: var(--containerSecondary);
  }

  ${({ active }) => active && activeTab}
`;

export const TabsSt = {
  Wrapper: TabWrapper,
  Content: TabContent,
  Option: TabOption,
  OptionName: TabOptionName,
  OptionClose: TabOptionClose,
};

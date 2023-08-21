import styled from "styled-components";

export const Editable = styled.div`
  padding: 0.25rem 0.5rem;
  min-height: 1rem;
  font-size: 1rem;
  outline: none;
  cursor: text;
  font-weight: 200;
  position: relative;
  white-space: pre-wrap;

  &:empty:before {
    content: attr(placeholder);
    color: #aaa;
    cursor: text;
  }
`;

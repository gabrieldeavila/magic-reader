import styled from "styled-components";

export const Editable = styled.div`
  padding: 0.5rem;
  min-height: 1rem;
  font-size: 1rem;
  outline: none;
  cursor: text;
  &:empty:before {
    content: attr(placeholder);
    color: #aaa;
    cursor: text;
  }
`;

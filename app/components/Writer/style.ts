import styled, { css } from "styled-components";

const base = css`
  padding: 0.25rem 0.5rem;
  min-height: 24px;
  font-size: 1rem;
  outline: none;
  cursor: text;
  font-weight: 200;
  position: relative;
  white-space: pre-wrap;

  .empty {
    min-height: 17px;
    min-width: 100%;
    display: inline-block;
  }

  &:empty::before {
    content: attr(placeholder);
    color: #aaa;
    cursor: text;
  }
`;

const p = styled.p`
  ${base};
`;

const h1 = styled.h1`
  ${base};
  font-size: 2rem;
  font-weight: 600;
`;

const h2 = styled.h2`
  ${base};
  font-size: 1.5rem;
  font-weight: 500;
`;

const h3 = styled.h3`
  ${base};
  font-size: 1.25rem;
  font-weight: 400;
`;

const ul = styled.div`
  ${base};
  list-style: disc;
  padding-left: 1rem;
`;

const nl = styled.div`
  ${base};
  list-style: decimal;
  padding-left: 1rem;
`;

export const Editable = {
  p,
  h1,
  h2,
  h3,
  ul,
  nl,
};

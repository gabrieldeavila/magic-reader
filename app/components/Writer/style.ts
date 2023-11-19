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
  padding-left: 2rem;
  padding-right: 2rem;

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

const bl = styled.div`
  ${base};
  list-style: disc;
  padding-left: 2rem;
  margin-left: 1.3rem;

  &::before {
    content: "";
    position: absolute;
    left: 0.7rem;
    top: 40%;
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 50%;
    background: var(--contrast);
  }
`;

const nl = styled.div`
  ${base};
  list-style: decimal;
  padding-left: 2rem;
  margin-left: 1.3rem;

  &::before {
    content: attr(data-placeholder-number) ". ";
    position: absolute;
    left: 0.7rem;
    color: var(--contrast-0_1);
  }
`;

const tl = styled.div`
  ${base};
  list-style: none;
  padding-left: 2rem;
  margin-left: 1.3rem;
  position: relative;
`;

export const TodoButton = styled.div`
  position: absolute;
  cursor: pointer;
  user-select: none;
  left: 0.7rem;
  top: 0.6rem;
  user-select: none;
  background: none;
  border: 1px solid var(--contrast-0_1);
  border-radius: 0.25rem;
  width: 13px;
  height: 13px;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    margin-top: 1px;
  }
`;

const WritterWrapper = styled.div`
  display: flex;
  justify-content: center;
  padding-bottom: 2rem;
`;

const WritterContainer = styled.div`
  max-width: 800px;
`;

export const StyledWriter = {
  Wrapper: WritterWrapper,
  Container: WritterContainer,
};

export const Editable = {
  p,
  h1,
  h2,
  h3,
  bl,
  nl,
  tl,
};

const ScribereWrapper = styled.div`
  display: flex;
  justify-content: center;
`;

const ScribereWriter = styled.div`
  width: -webkit-fill-available;
  position: fixed;
  left: 3rem;
  top: 1.75rem;
`;

export const Scribere = {
  Wrapper: ScribereWrapper,
  Writer: ScribereWriter,
};

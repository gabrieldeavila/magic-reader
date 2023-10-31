import styled from "styled-components";

const Wrapper = styled.div`
  padding: 2rem;
  max-width: 800px;
  overflow: hidden;
  user-select: none;
`;

const Title = styled.h2``;

const List = styled.ul`
  list-style: none;
  padding-left: 0.5rem;

  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
`;

const Container = styled.div`
  & > ${List} {
    padding-left: 0;
  }
`;

const A = styled.a`
  margin-top: 0.1rem;
  padding: 0.25rem 0.1rem;
  border-radius: 5px;

  display: block;
  color: var(--contrast-0_5);
  font-weight: 300;

  transition: all 0.1s ease-in-out;

  &:hover {
    background: var(--contrast-0_5);
  }

  &:active {
    transform: scale(0.98);
  }
`;

export const STOC = {
  Wrapper,
  Container,
  Title,
  List,
  A,
};

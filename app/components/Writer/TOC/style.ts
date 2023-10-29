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
  & > ${List}  {
    padding-left: 0;
  }
`;

export const STOC = {
  Wrapper,
  Container,
  Title,
  List,
};

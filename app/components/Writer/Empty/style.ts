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
  align-items: center;
  justify-content: center;
  opacity: 0.3;
  width: 100%;

  svg {
    max-width: 100%;
  }
`;

export const EmptySt = {
  Wrapper: EmptyWrapper,
  Content: EmptyContent,
};

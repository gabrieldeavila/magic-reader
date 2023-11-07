import styled from "styled-components";

const Img = styled.img`
  max-width: 100%;
  position: relative;
  border-radius: 0.5rem;
  margin: 0.5rem 0;
  user-select: none;

  transition: 0.2s ease-in-out;

  &:hover {
    opacity: 0.8;
  }
`;

const Wrapper = styled.div`
  position: relative;
  display: flex;
  justify-content: center;

  cursor: pointer;
`;

const SvgWrapper = styled.div`
  position: absolute;
  top: 0.5rem;
  z-index: 5
`;

const ImageComp = {
  Img,
  Wrapper,
  Svg: SvgWrapper,
};

export default ImageComp;

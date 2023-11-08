import styled from "styled-components";

const Img = styled.img`
  max-width: 100%;
  position: relative;
  border-radius: 0.5rem;
  user-select: none;

  transition: 0.2s ease-in-out;

  &:hover {
    opacity: 0.8;
  }
`;

const SvgWrapper = styled.div`
  position: absolute;
  top: 0.75rem;
  margin: 0.5rem 0;
  right: 0.5rem;
  z-index: 5;
  opacity: 0;
  transition: 0.2s ease-in-out;
`;

const Wrapper = styled.div`
  position: relative;
  display: flex;
  gap: 0.5rem;
  flex-direction: column;
  justify-content: center;
  transition: 0.2s ease-in-out;

  &:hover {
    ${SvgWrapper} {
      opacity: 1;
    }
  }
`;

const IconBtn = styled.div`
  display: flex;
  background: var(--primary-0_2);
  border-radius: 0.5rem;
  padding: 0.5rem;
  cursor: pointer;
  border: none;
  transition: 0.2s ease-in-out;

  &:hover {
    background: var(--primary-0_1);
  }
`;

const Caption = styled.div`
  color: var(--contrast-0_5);
  outline: none;
  font-size: 0.75rem;
  text-align: center;

  &:empty::after {
    content: attr(placeholder);
    opacity: 0;
  }

  &:empty:focus::after {
    content: attr(placeholder);
    opacity: 1;
    transition: 0.2s ease-in-out;
  }
`;

const ImageComp = {
  Img,
  Wrapper,
  Svg: SvgWrapper,
  IconBtn,
  Caption,
};

export default ImageComp;

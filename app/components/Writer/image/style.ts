import { shadows } from "@geavila/gt-design";
import styled from "styled-components";

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
`;

const Image = styled.img`
  height: 150px;
  width: 100%;
  user-select: none;

  object-fit: cover;
`;

const Title = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: -1.5rem;
  gap: 0.5rem;
  max-width: 100%;
  padding: 0 2rem;
`;

const H1 = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: var(--contrast);
  outline: none;
  word-break: break-word;
  text-align: center;

  /* add shadow */
  text-shadow: 0 0 0.5rem var(--primary);
`;

const Emoji = styled.span`
  cursor: pointer;
  font-size: 2rem;
`;

const EmojiPicker = styled.div`
  position: absolute;
  z-index: 10;
`;

const Change = styled.div`
  transition: 0.2s ease-in-out;

  ${({ show }: { show: boolean }) => `
  opacity: ${show ? 1 : 0};
  transform: ${
    show ? "scale(1) translateY(0)" : "scale(0.95) translateY(-1rem)"
  };
  pointer-events: ${show ? "all" : "none"};
`}

  position: absolute;
  top: 100px;
  right: 2rem;
`;

const WritterImg = {
  Wrapper,
  Image,
  Emoji,
  EmojiPicker,
  Title,
  H1,
  Change,
};

export default WritterImg;

const UnsplashWrapper = styled.div`
  position: absolute;
  top: 150px;
  right: 2rem;
  width: 520px;
  background: var(--secondary);
  padding: 1rem;
  border-radius: 5px;
  ${shadows.basic}
  z-index: 101;
`;

const UnplashModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  z-index: 100;
  width: 100vw;
  height: 100vh;
`;

const UnsplashContainer = styled.div`
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const UnsplashImg = styled.img`
  width: 250px;
  height: 150px;
  object-fit: cover;
  border-radius: 5px;
`;

const UnsplashAuthor = styled.a`
  color: var(--contrast);
  font-size: 0.8rem;
  text-decoration: none;
`;

const UnsplashImgWrapper = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: 0.2s ease-in-out;

  &:hover {
    transform: scale(1.05);
  }

  &:hover ${UnsplashAuthor} {
    opacity: 1;
  }

  &:hover ${UnsplashImg} {
    filter: brightness(0.5);
  }

  &:active {
    transform: scale(0.95);
  }
`;

export const UnsplashSty = {
  Wrapper: UnsplashWrapper,
  Modal: UnplashModal,
  Img: UnsplashImg,
  Author: UnsplashAuthor,
  Container: UnsplashContainer,
  ImgWrapper: UnsplashImgWrapper,
};

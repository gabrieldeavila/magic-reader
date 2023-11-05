import styled from "styled-components";

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
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
`;

const H1 = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: var(--contrast);

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

const WritterImg = {
  Wrapper,
  Image,
  Emoji,
  EmojiPicker,
  Title,
  H1,
};

export default WritterImg;

import { Space, scrolls, shadows } from "@geavila/gt-design";
import styled from "styled-components";

export const ReadContent = styled(Space.Modifiers)`
  display: initial;
  padding: 1rem;
  background-color: var(--secondary-0_5);
  border-radius: 5px;
  ${shadows.simple};
  ${scrolls.default};
`;

export const TextArea = styled.div`
  background: var(--primary);
  padding: 1rem;
  color: var(--contrast);
  font-size: 1.15rem;
  border-radius: 5px;
  resize: none;
  min-height: 155px;
  height: 100% !important;
  width: 500px !important;
  min-height: 155px;
  ${scrolls.default};
  ${shadows.simple};

  /* when it's mobile */
  @media (max-width: 768px) {
    width: -webkit-fill-available !important;
  }
`;

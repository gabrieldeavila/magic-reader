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

export const TextArea = styled.textarea`
  background: var(--primary);
  color: var(--contrast);
  font-size: 1.15rem;
  border-radius: 5px;
  resize: none;
  max-width: 500px !important;
  height: 100% !important;
  min-height: 155px;
  ${scrolls.default};
  ${shadows.simple};
`;

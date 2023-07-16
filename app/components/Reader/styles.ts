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

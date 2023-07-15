import { Space, scrolls, shadows } from "@geavila/gt-design";
import styled from "styled-components";

export const ReadContent = styled(Space.Modifiers)`
  display: initial;
  padding: 1rem;
  background-color: var(--secondary);
  border-radius: 5px;
  ${shadows.basic};
  ${scrolls.default};
`;

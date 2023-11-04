import styled from "styled-components";

export const DCode = styled.span.attrs(({ as }: { as?: string }) => ({
  as: as || "code",
}))`
  @import url("https://fonts.googleapis.com/css2?family=Fira+Code:wght@500&display=swap");
  font-family: "Fira Code", monospace;

  * {
    border-radius: inherit !important;
    padding: 0 !important;
  }

  code {
    white-space: break-spaces !important;
    padding: 0 2px !important;
  }
`;

export const ReadWrite = styled.div`
  outline: none;
`;

export const Selector = styled.div`
  position: fixed;
  background: var(--contrast);
  opacity: 0.7;
  border-radius: 0.2rem;
  z-index: 2;
`;

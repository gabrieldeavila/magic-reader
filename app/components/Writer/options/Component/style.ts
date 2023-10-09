import styled from "styled-components";

export const DCode = styled.span`
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

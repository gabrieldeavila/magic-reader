import styled from "styled-components";

const FolderWrapper = styled.div`
  background: red;
  padding-right: 2rem;
`;

const FolderContainer = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const FolderInputContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const FolderInput = styled.input`
  border-radius: 0.25rem;
  border: 1px solid var(--outline);
  background: none;
  width: -webkit-fill-available;
`;

const ExplorerSt = {
  Folder: {
    Wrapper: FolderWrapper,
    Container: FolderContainer,
    Input: {
      Content: FolderInputContent,
      Input: FolderInput,
    },
  },
};

export default ExplorerSt;

import styled from "styled-components";

const FolderWrapper = styled.div``;

const FolderContainer = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const FolderInputContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 75%;
`;

const FolderNamer = styled.div`
  border-radius: 0.25rem;
  border: 1px solid var(--outline);
  background: none;
  font-size: 0.75rem;
  white-space: nowrap;
  font-weight: 300;
  padding: 0 0.25rem;
  overflow: hidden;
  outline-color: var(--outline);
`;

const FolderIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
`;

const VisualizationWrapper = styled.div``;
const VisualizationContainer = styled.div``;
const VisualizationFile = styled.div`
  font-size: 0.75rem;
  font-weight: 300;
`;

const ExplorerSt = {
  Visualization: {
    Wrapper: VisualizationWrapper,
    Container: VisualizationContainer,
    File: VisualizationFile
  },
  Folder: {
    Wrapper: FolderWrapper,
    Container: FolderContainer,
    Icon: FolderIcon,
    Input: {
      Content: FolderInputContent,
      Namer: FolderNamer,
    },
  },
};

export default ExplorerSt;

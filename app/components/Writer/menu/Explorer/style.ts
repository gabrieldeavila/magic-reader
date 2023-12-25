import styled from "styled-components";

const FolderWrapper = styled.div`
  padding-left: 0.5rem;
`;

const FolderContainer = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const FolderInputContent = styled.div<{ isFile?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: ${({ isFile }) => (isFile ? "100%" : "calc(75% - 0.5rem)")};
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

const VisualizationContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const getBackground = (active?: boolean, selected?: boolean) => {
  if (active) return "var(--preSelectColor)";

  if (selected) return "var(--outline-0_5)";

  return "transparent";
};

const getBorder = (active?: boolean, selected?: boolean, isHover?: boolean) => {
  if (isHover) {
    if (selected) return "1px solid var(--outline-0_5)";

    if (!active) return "1px solid var(--preSelectColor)";

    return "1px solid var(--primary-0_2)";
  }

  if (selected) return "1px solid var(--outline)";

  if (active) return "1px solid var(--preSelectColor)";

  return "1px solid transparent";
};

const getHover = (active?: boolean, selected?: boolean) => {
  if (active) return "transparent";

  if (selected) return "transparent";

  return "var(--primary-0_5)";
};

const VisualizationFile = styled.div<{ active?: boolean; selected?: boolean }>`
  font-size: 0.75rem;
  font-weight: 300;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  cursor: pointer;
  overflow: hidden;

  background-color: ${({ active, selected }) =>
    getBackground(active, selected)};

  border: ${({ active, selected }) => getBorder(active, selected)};

  &:hover {
    background-color: ${({ active, selected }) => getHover(active, selected)};
    border: ${({ active, selected }) => getBorder(active, selected, true)};
  }

  & span:nth-child(2) {
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const ExplorerSt = {
  Visualization: {
    Wrapper: VisualizationWrapper,
    Container: VisualizationContainer,
    File: VisualizationFile,
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

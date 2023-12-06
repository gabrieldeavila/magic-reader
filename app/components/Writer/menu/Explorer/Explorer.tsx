import { useGTTranslate } from "@geavila/gt-design";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { ChevronRight, FilePlus, FolderPlus } from "react-feather";
import { stateStorage, useTriggerState } from "react-trigger-state";
import { Scribere, db } from "../../../Dexie/Dexie";
import MenuSt from "../style";
import FolderClosed from "./FolderClosed";
import ExplorerSt from "./style";

function Explorer() {
  const { translateThis } = useGTTranslate();

  const handleAddNewFolder = useCallback(() => {
    stateStorage.set("add_new_filter", new Date());
  }, []);

  return (
    <>
      <MenuSt.Title.Content>
        <MenuSt.Title.Name>
          {translateThis("SCRIBERE.EXPLORER")}
        </MenuSt.Title.Name>
        <MenuSt.Title.Options>
          <MenuSt.Title.Option title={translateThis("SCRIBERE.NEW_FILE")}>
            <FilePlus size={16} />
          </MenuSt.Title.Option>
          <MenuSt.Title.Option
            role="button"
            onClick={handleAddNewFolder}
            title={translateThis("SCRIBERE.NEW_FOLDER")}
          >
            <FolderPlus size={16} />
          </MenuSt.Title.Option>
        </MenuSt.Title.Options>
      </MenuSt.Title.Content>

      <ExplorerContent />
    </>
  );
}

export default Explorer;

const ExplorerContent = memo(() => {
  const [scribere, setScribere] = useState<Scribere[]>([]);
  const [addNewFilter, setAddNewFilter] = useTriggerState({
    name: "add_new_filter",
    initial: null,
  });

  const [showAddNewFolder, setShowAddNewFolder] = useTriggerState({
    name: "show_add_new_folder",
    initial: false,
  });

  useEffect(() => {
    if (addNewFilter == null) return;

    setAddNewFilter(null);
    setShowAddNewFolder(true);
  }, [addNewFilter, setAddNewFilter, setShowAddNewFolder]);

  useEffect(() => {
    (async () => {
      const val = await db.scribere.where("folderId").equals(-1).toArray();

      setScribere(val);
    })();
  }, []);

  const handleRef = useCallback((node) => {
    stateStorage.set("explorer_content", node);
  }, []);

  return (
    <ExplorerSt.Visualization.Wrapper ref={handleRef}>
      <ExplorerSt.Visualization.Container>
        {scribere.map((scribere, index) => {
          return (
            <ExplorerSt.Visualization.File key={index}>
              {scribere.name}
            </ExplorerSt.Visualization.File>
          );
        })}

        {showAddNewFolder && <NewFolder />}
      </ExplorerSt.Visualization.Container>
    </ExplorerSt.Visualization.Wrapper>
  );
});

ExplorerContent.displayName = "ExplorerContent";

const NewFolder = memo(() => {
  const inputRef = useRef(null);
  const iconRef = useRef(null);

  useEffect(() => {
    inputRef.current.focus();
  }, []);

  useEffect(() => {
    const handler = () => {
      const bounds = stateStorage
        .get("explorer_content")
        .getBoundingClientRect();

      if (bounds.width == null) return;

      const iconWidth = iconRef.current.getBoundingClientRect().width;

      const width = bounds.width - iconWidth - 20;

      inputRef.current.style.width = `${width}px`;
    };

    handler();

    // gets when the explorer content is resized
    const resizeObserver = new ResizeObserver(handler);
    resizeObserver.observe(stateStorage.get("explorer_content"));

    // cleanup
    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  const handleBlur = useCallback(() => {
    stateStorage.set("show_add_new_folder", false);
  }, []);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "Enter") {
        handleBlur();
      }
    },
    [handleBlur]
  );

  return (
    <ExplorerSt.Folder.Wrapper>
      <ExplorerSt.Folder.Container>
        <ExplorerSt.Folder.Icon ref={iconRef}>
          <ChevronRight size={13} />
          <FolderClosed />
        </ExplorerSt.Folder.Icon>

        <ExplorerSt.Folder.Input.Content>
          <ExplorerSt.Folder.Input.Namer
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            ref={inputRef}
            contentEditable
          />
        </ExplorerSt.Folder.Input.Content>
      </ExplorerSt.Folder.Container>
    </ExplorerSt.Folder.Wrapper>
  );
});

NewFolder.displayName = "NewFolder";

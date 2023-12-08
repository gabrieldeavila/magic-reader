import { useGTTranslate } from "@geavila/gt-design";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronRight, FilePlus, FolderPlus } from "react-feather";
import { stateStorage, useTriggerState } from "react-trigger-state";
import { Folders, Scribere, db } from "../../../Dexie/Dexie";
import MenuSt from "../style";
import FolderClosed from "./FolderClosed";
import ExplorerSt from "./style";
import CREATE_FOLDER from "../../_commands/folder/CREATE";
import FolderOpened from "./FolderOpened";

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
          <MenuSt.Title.Option
            role="button"
            onClick={() => stateStorage.set("show_add_new_file", true)}
            title={translateThis("SCRIBERE.NEW_FILE")}
          >
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

const ExplorerContent = memo(({ id = -1 }: { id?: number }) => {
  const [scribere, setScribere] = useState<Scribere[]>([]);
  const [folders, setFolders] = useState<Folders[]>([]);

  const [addNewFilter, setAddNewFilter] = useTriggerState({
    name: "add_new_filter",
    initial: null,
  });

  const [showAddNewFolder, setShowAddNewFolder] = useTriggerState({
    name: "show_add_new_folder",
    initial: false,
  });

  const [showAddNewFile] = useTriggerState({
    name: "show_add_new_file",
    initial: false,
  });

  useEffect(() => {
    if (addNewFilter == null) return;

    setAddNewFilter(null);
    setShowAddNewFolder(true);
  }, [addNewFilter, setAddNewFilter, setShowAddNewFolder]);

  useEffect(() => {
    (async () => {
      const val = await db.scribere.where("folderId").equals(id).toArray();

      setScribere(val);
      const folders = await db.folders
        .where("folderParentId")
        .equals(id)
        .toArray();

      setFolders(folders);
    })();
  }, [id]);

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

        {folders.map((folder, index) => {
          return <Folder folder={folder} key={index} />;
        })}

        {showAddNewFolder && <NewFolder />}

        {showAddNewFile && <NewFolder isFile />}
      </ExplorerSt.Visualization.Container>
    </ExplorerSt.Visualization.Wrapper>
  );
});

ExplorerContent.displayName = "ExplorerContent";

const Folder = memo(({ folder }: { folder: Folders }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFolder, setSelectedFolder] = useTriggerState({
    name: "selected_folder",
    initial: null,
  });

  const handleFolderClick = useCallback(() => {
    setIsOpen((prev) => {
      const value = !prev;

      if (value) {
        setSelectedFolder(folder.id);
      } else {
        setSelectedFolder(null);
      }

      return value;
    });
  }, [folder, setSelectedFolder]);

  return (
    <>
      <ExplorerSt.Visualization.File
        active={selectedFolder === folder.id}
        onClick={handleFolderClick}
      >
        <ExplorerSt.Folder.Icon>
          {isOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
          {isOpen ? <FolderOpened /> : <FolderClosed />}
        </ExplorerSt.Folder.Icon>
        {folder.name}
      </ExplorerSt.Visualization.File>
      {isOpen && <ExplorerContent id={folder.id} />}
    </>
  );
});

Folder.displayName = "Folder";

const NewFolder = memo(({ isFile }: { isFile?: boolean }) => {
  const inputRef = useRef(null);
  const iconRef = useRef(null);

  useEffect(() => {
    inputRef.current.focus();
  }, []);

  useEffect(() => {
    if (isFile) return;
    const handler = () => {
      const bounds = stateStorage
        .get("explorer_content")
        .getBoundingClientRect();

      if (bounds.width == null) return;

      const iconWidth = iconRef.current.getBoundingClientRect().width;

      const width = bounds.width - iconWidth - 30;

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
  }, [isFile]);

  const handleBlur = useCallback(() => {
    stateStorage.set("show_add_new_folder", false);
    stateStorage.set("show_add_new_file", false);

    const name = inputRef.current.innerText as string;

    if (name.trim() === "") return;

    if (isFile) {
      console.log("safe");
      return;
    }

    CREATE_FOLDER({ name });
  }, [isFile]);

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
        {!isFile && (
          <ExplorerSt.Folder.Icon ref={iconRef}>
            <ChevronRight size={13} />
            <FolderClosed />
          </ExplorerSt.Folder.Icon>
        )}

        <ExplorerSt.Folder.Input.Content isFile={isFile}>
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

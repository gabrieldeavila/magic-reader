import { useGTTranslate } from "@geavila/gt-design";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronRight, FilePlus, FolderPlus } from "react-feather";
import {
  globalState,
  stateStorage,
  useTriggerState,
} from "react-trigger-state";
import { Folders, db } from "../../../Dexie/Dexie";
import CREATE_SCRIBERE from "../../_commands/CREATE";
import CREATE_FOLDER from "../../_commands/folder/CREATE";
import MenuSt from "../style";
import FolderClosed from "./FolderClosed";
import FolderOpened from "./FolderOpened";
import ExplorerSt from "./style";
import ContextMenu from "../../../ContextMenu/ContextMenu";

function Explorer() {
  const { translateThis } = useGTTranslate();

  const handleAddNewFolder = useCallback(() => {
    stateStorage.set("add_new_filter", new Date());
  }, []);

  const handleAddNewFile = useCallback(() => {
    stateStorage.set("show_add_new_file", true);
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
            onClick={handleAddNewFile}
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

const ExplorerContent = memo(
  ({ id = -1, depth = 0 }: { id?: number; depth?: number }) => {
    const [scribere, setScribere] = useTriggerState({
      name: `explorer_scribere_${id}`,
      initial: [],
    });
    const [folders, setFolders] = useTriggerState({
      name: `explorer_folder_${id}`,
      initial: [],
    });

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

    const [selectedFolder] = useTriggerState({
      name: "selected_folder",
      initial: -1,
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
    }, [id, setFolders, setScribere]);

    const handleRef = useCallback((node) => {
      stateStorage.set("explorer_content", node);
    }, []);

    return (
      <ExplorerSt.Visualization.Wrapper ref={handleRef}>
        <ExplorerSt.Visualization.Container
          style={{
            paddingLeft: `${depth * 10}px`,
          }}
        >
          {folders.map((folder, index) => {
            return <Folder depth={depth} folder={folder} key={index} />;
          })}

          {showAddNewFolder && selectedFolder === id && <NewFolder id={id} />}

          {scribere.map((scribere, index) => {
            return (
              <ExplorerSt.Visualization.File key={index}>
                {scribere.name}
              </ExplorerSt.Visualization.File>
            );
          })}

          {showAddNewFile && selectedFolder === id && (
            <NewFolder id={id} isFile />
          )}
        </ExplorerSt.Visualization.Container>
      </ExplorerSt.Visualization.Wrapper>
    );
  }
);

ExplorerContent.displayName = "ExplorerContent";

const Folder = memo(({ folder, depth }: { folder: Folders; depth: number }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [show, setShow] = useState(false);

  const [selectedFolder, setSelectedFolder] = useTriggerState({
    name: "selected_folder",
    initial: null,
  });

  const [showContextMenu, setShowContextMenu] = useState(false);

  const handleFolderClick = useCallback(() => {
    setShow(true);

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

  const handleMenu = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    setShowContextMenu(true);
  }, [setShowContextMenu]);

  return (
    <>
      <ExplorerSt.Visualization.File
        active={selectedFolder === folder.id}
        role="button"
        onContextMenu={handleMenu}
        onClick={handleFolderClick}
      >
        <ExplorerSt.Folder.Icon>
          {isOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
          {isOpen ? <FolderOpened /> : <FolderClosed />}
        </ExplorerSt.Folder.Icon>
        {folder.name}
      </ExplorerSt.Visualization.File>

      {show && (
        <div
          style={{
            display: isOpen ? "block" : "none",
          }}
        >
          <ExplorerContent depth={depth + 1} id={folder.id} />
        </div>
      )}

      {showContextMenu && <ContextMenu />}
    </>
  );
});

Folder.displayName = "Folder";

const NewFolder = memo(({ isFile, id }: { isFile?: boolean; id: number }) => {
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

  const handleBlur = useCallback(async () => {
    stateStorage.set("show_add_new_folder", false);
    stateStorage.set("show_add_new_file", false);

    const name = inputRef.current.innerText as string;

    if (name.trim() === "") return;

    if (isFile) {
      const newScribere = await CREATE_SCRIBERE(
        name,
        globalState.get("selected_folder")
      );

      const currTabs = stateStorage.get("tabs");
      const newTabs = [
        ...currTabs,
        { id: newScribere.id, name: newScribere.name },
      ];
      stateStorage.set("tabs", newTabs);

      const scriberes = globalState.get(`explorer_scribere_${id}`);

      scriberes.push(newScribere);
      stateStorage.set(`explorer_scribere_${id}`, [...scriberes]);

      return;
    }

    const newFolder = await CREATE_FOLDER({
      name,
      folderParentId: globalState.get("selected_folder"),
    });

    const folders = globalState.get(`explorer_folder_${id}`);
    folders.push(newFolder);

    stateStorage.set(`explorer_folder_${id}`, [...folders]);
  }, [id, isFile]);

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

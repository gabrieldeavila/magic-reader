import { useGTTranslate } from "@geavila/gt-design";
import Link from "next/link";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, ChevronRight, FilePlus, FolderPlus } from "react-feather";
import {
  globalState,
  stateStorage,
  useTriggerState,
} from "react-trigger-state";
import { Folders, Scribere, db } from "../../../Dexie/Dexie";
import CREATE_SCRIBERE from "../../_commands/CREATE";
import CREATE_FOLDER from "../../_commands/folder/CREATE";
import MenuSt from "../style";
import FolderClosed from "./FolderClosed";
import FolderOpened from "./FolderOpened";
import FileMenu from "./Menus/File";
import FolderMenu from "./Menus/Folder";
import ExplorerSt from "./style";

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

          {showAddNewFolder && selectedFolder === id && <NewFolder depth={depth} id={id} />}

          {scribere.map((scribere: Scribere) => {
            return <File {...scribere} key={scribere.id} />;
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

const File = memo(({ name, id, emoji }: Scribere) => {
  const [activeTab] = useTriggerState({ name: "active_tab" });
  const [selectedFile, setSelectedFile] = useState(null);
  const isActive = useMemo(() => activeTab === id, [activeTab, id]);
  const [lang] = useTriggerState({ name: "lang" });
  const contextMenuRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [customName] = useTriggerState({
    name: `scribere_custom_name_${id}`,
    initial: null,
  });
  const [customEmoji] = useTriggerState({
    name: `scribere_custom_emoji_${id}`,
    initial: null,
  });
  const [showRename, setShowRename] = useState(false);

  const fileName = useMemo(() => {
    if (customName) return customName;

    return name;
  }, [customName, name]);

  const fileEmoji = useMemo(() => {
    if (customEmoji) return customEmoji;

    return emoji;
  }, [customEmoji, emoji]);

  const handleMenu = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();

      // gets the click position
      const x = e.clientX;
      const y = e.clientY;

      contextMenuRef.current = { x, y };

      setSelectedFile(id);
      setShowContextMenu(true);
    },
    [id, setSelectedFile]
  );

  const handleRename = useCallback(() => {
    setShowRename(true);
  }, []);

  const handleRenameFile = useCallback(
    (name: string) => {
      setShowRename(false);
      // removes all \n
      name = name.replace(/\n/g, "");

      stateStorage.set(`scribere_custom_name_${id}`, name);
      db.scribere.update(id, { name });

      const currTabs = stateStorage.get("tabs");

      const newTabs = currTabs.map((tab: any) => {
        if (tab.id === id) {
          return { ...tab, name };
        }

        return tab;
      });

      stateStorage.set("tabs", newTabs);

      if (isActive) {
        globalState.set("avoid-title-pos", true);
        stateStorage.set(`${id}_writter_context_title`, name);
      }
    },
    [id, isActive]
  );

  useEffect(() => {
    if (showContextMenu) return;

    setSelectedFile(null);
  }, [showContextMenu]);

  return (
    <>
      {!showRename ? (
        <Link
          style={{ textDecoration: "none" }}
          href={`/${lang}/scribere/${id}`}
          passHref
        >
          <ExplorerSt.Visualization.File
            active={isActive}
            selected={selectedFile === id}
            onContextMenu={handleMenu}
          >
            <span>{fileEmoji}</span>
            <span>{fileName}</span>
          </ExplorerSt.Visualization.File>
        </Link>
      ) : (
        <NewFolder
          id={id}
          onBlur={handleRenameFile}
          isFile
          prevValue={fileName}
        />
      )}

      {showContextMenu && (
        <FileMenu
          onRename={handleRename}
          setShowContextMenu={setShowContextMenu}
          position={contextMenuRef.current}
        />
      )}
    </>
  );
});

File.displayName = "File";

const Folder = memo(({ folder, depth }: { folder: Folders; depth: number }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [show, setShow] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const [selectedFolder, setSelectedFolder] = useTriggerState({
    name: "selected_folder",
    initial: null,
  });

  const [showContextMenu, setShowContextMenu] = useState(false);

  const handleFolderClick = useCallback(
    (_: any, val?: boolean) => {
      setShow(true);

      setIsOpen((prev) => {
        const value = val ?? !prev;

        if (value) {
          setSelectedFolder(folder.id);
        } else {
          setSelectedFolder(null);
        }

        return value;
      });
    },
    [folder, setSelectedFolder]
  );

  const contextMenuRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const handleMenu = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();

      // gets the click position
      const x = e.clientX;
      const y = e.clientY;

      contextMenuRef.current = { x, y };

      setShowContextMenu(true);
      setSelectedFile(folder.id);
    },
    [folder.id]
  );

  useEffect(() => {
    if (showContextMenu) return;

    setSelectedFile(null);
  }, [showContextMenu]);

  const handleAddNewFolder = useCallback(() => {
    handleFolderClick(null, true);

    stateStorage.set("add_new_filter", new Date());
    stateStorage.set("selected_folder", folder.id);

    setShowContextMenu(false);
  }, [folder.id, handleFolderClick]);

  const handleAddNewFile = useCallback(() => {
    handleFolderClick(null, true);

    stateStorage.set("show_add_new_file", true);
    stateStorage.set("selected_folder", folder.id);

    setShowContextMenu(false);
  }, [folder.id, handleFolderClick]);

  return (
    <>
      <ExplorerSt.Visualization.File
        active={selectedFolder === folder.id}
        selected={selectedFile === folder.id}
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

      {showContextMenu && (
        <FolderMenu
          onAddNewFolder={handleAddNewFolder}
          onAddNewFile={handleAddNewFile}
          setShowContextMenu={setShowContextMenu}
          position={contextMenuRef.current}
        />
      )}
    </>
  );
});

Folder.displayName = "Folder";

const NewFolder = memo(
  ({
    isFile,
    id,
    prevValue,
    onBlur,
    depth = 0
  }: {
    isFile?: boolean;
    id: number;
    prevValue?: string;
    onBlur?: (name: string) => void;
    depth?: number
  }) => {
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

        const width = bounds.width - iconWidth - 30 - depth * 10;

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
    }, [depth, isFile]);

    const handleBlur = useCallback(async () => {
      stateStorage.set("show_add_new_folder", false);
      stateStorage.set("show_add_new_file", false);

      const name = inputRef.current.innerText as string;

      if (name.trim() === "") return;

      if (onBlur) {
        onBlur(name);
        return;
      }

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
    }, [id, isFile, onBlur]);

    const handleKeyDown = useCallback(
      (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === "Enter") {
          handleBlur();
        }
      },
      [handleBlur]
    );

    useEffect(() => {
      if (prevValue == null) return;

      inputRef.current.innerText = prevValue;
      // select all the text
      const range = document.createRange();
      range.selectNodeContents(inputRef.current);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
    }, [prevValue]);

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
              defaultValue={prevValue}
              contentEditable
            />
          </ExplorerSt.Folder.Input.Content>
        </ExplorerSt.Folder.Container>
      </ExplorerSt.Folder.Wrapper>
    );
  }
);

NewFolder.displayName = "NewFolder";

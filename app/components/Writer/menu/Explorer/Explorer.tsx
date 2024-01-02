import { useGTTranslate } from "@geavila/gt-design";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, ChevronRight, FilePlus, FolderPlus } from "react-feather";
import {
  globalState,
  stateStorage,
  useTriggerState,
} from "react-trigger-state";
import { Folders, Scribere, db } from "../../../Dexie/Dexie";
import CREATE_SCRIBERE from "../../_commands/file/CREATE";
import CREATE_FOLDER from "../../_commands/folder/CREATE";
import useFoldersParents from "../../hooks/crud/useFoldersParents";
import MenuSt from "../style";
import FolderClosed from "./FolderClosed";
import FolderOpened from "./FolderOpened";
import ExplorerPortal from "./Menus/Explorer";
import FileMenu from "./Menus/File";
import FolderMenu from "./Menus/Folder";
import Selector from "./Selector/Selector";
import useDrag from "./hooks/useDrag";
import ExplorerSt from "./style";

function Explorer() {
  const { translateThis } = useGTTranslate();

  const handleAddNewFolder = useCallback(() => {
    stateStorage.set("add_new_folder", new Date());
  }, []);

  const handleAddNewFile = useCallback(() => {
    stateStorage.set("show_add_new_file", true);
  }, []);

  useTriggerState({
    name: "explorer-selected-folders",
    initial: {},
  });

  useTriggerState({
    name: "explorer-folders-ref",
    initial: {},
  });

  useTriggerState({
    name: "explorer-selected-files",
    initial: {},
  });

  useFoldersParents();

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

      <ExplorerPortal />

      <Selector />

      <MenuSt.Overflow>
        <ExplorerContent />
      </MenuSt.Overflow>
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
      name: "add_new_folder",
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

        const sortedScribere = val.sort((a, b) => {
          if (a.name < b.name) return -1;

          if (a.name > b.name) return 1;

          return 0;
        });

        setScribere(sortedScribere);

        const folders = await db.folders
          .where("folderParentId")
          .equals(id)
          .toArray();

        // sort by name, ascending
        const sortedFolders = folders.sort((a, b) => {
          if (a.name < b.name) return -1;

          if (a.name > b.name) return 1;

          return 0;
        });
        setFolders(sortedFolders);
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
            return (
              <Folder depth={depth} folder={folder} key={index} parentId={id} />
            );
          })}

          {showAddNewFolder && selectedFolder === id && (
            <NewFolder depth={depth} id={id} />
          )}

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

const File = memo(({ name, id, emoji, folderId }: Scribere) => {
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
  const router = useRouter();

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

  const handleOpen = useCallback(() => {
    router.push(`/${lang}/scribere/${id}`);

    setShowContextMenu(false);
  }, [id, lang, router]);

  const handleLinkClick = useCallback(() => {
    stateStorage.set("selected_folder", null);
  }, []);

  const dataFileSelect = useMemo(() => {
    return {
      "data-file-select": id,
      "data-selector": id,
    };
  }, [id]);

  const [selectorBounds] = useTriggerState({
    name: "selector_bounds",
    initial: {},
  });

  const fileRef = useRef<HTMLAnchorElement>(null);

  const isFileSelected = useMemo(() => {
    if (selectorBounds == null) return false;

    if (fileRef.current == null) return false;

    const fileBounds = fileRef.current.getBoundingClientRect();

    const isY =
      fileBounds.bottom >= selectorBounds.top &&
      fileBounds.top <= selectorBounds.bottom;

    const isX =
      fileBounds.right >= selectorBounds.left &&
      fileBounds.left <= selectorBounds.right;

    return isY && isX;
  }, [selectorBounds]);

  useEffect(() => {
    const files = stateStorage.get("explorer-selected-files");

    if (isFileSelected) {
      stateStorage.set("explorer-selected-files", {
        ...files,
        [id]: {
          folderId,
        },
      });
    } else {
      delete files[id];

      stateStorage.set("explorer-selected-files", { ...files });
    }
  }, [folderId, id, isFileSelected]);

  const { DragComponent } = useDrag({ ref: fileRef, id, isFile: true });

  return (
    <>
      {DragComponent()}
      {!showRename ? (
        <Link
          style={{ textDecoration: "none", userSelect: "none" }}
          onClick={handleLinkClick}
          ref={fileRef}
          draggable={false}
          href={`/${lang}/scribere/${id}`}
          passHref
          {...dataFileSelect}
        >
          <ExplorerSt.Visualization.File
            active={isActive && !isFileSelected}
            selected={selectedFile === id || isFileSelected}
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
          onOpen={handleOpen}
          onRename={handleRename}
          setShowContextMenu={setShowContextMenu}
          id={id}
          position={contextMenuRef.current}
        />
      )}
    </>
  );
});

File.displayName = "File";

const Folder = memo(
  ({
    folder,
    depth,
    parentId,
  }: {
    folder: Folders;
    depth: number;
    parentId: number;
  }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [show, setShow] = useState(false);
    const [showRename, setShowRename] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);

    const [foldersParent] = useTriggerState({
      name: "folders_parents",
      initial: [],
    });

    const [customFolderName] = useTriggerState({
      name: `folder_custom_name_${folder.id}`,
      initial: null,
    });

    const customName = useMemo(() => {
      if (customFolderName) return customFolderName;

      return folder.name;
    }, [customFolderName, folder.name]);

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

      stateStorage.set("add_new_folder", new Date());
      stateStorage.set("selected_folder", folder.id);

      setShowContextMenu(false);
    }, [folder.id, handleFolderClick]);

    const handleAddNewFile = useCallback(() => {
      handleFolderClick(null, true);

      stateStorage.set("show_add_new_file", true);
      stateStorage.set("selected_folder", folder.id);

      setShowContextMenu(false);
    }, [folder.id, handleFolderClick]);

    const handleRenameFolder = useCallback(
      (name: string) => {
        stateStorage.set("show_rename_folder", false);
        // removes all \n
        name = name.replace(/\n/g, "");

        stateStorage.set(`folder_custom_name_${folder.id}`, name);
        db.folders.update(folder.id, { name });
        setShowRename(false);
      },
      [folder.id]
    );

    const startRename = useCallback(() => {
      setShowRename(true);

      setShowContextMenu(false);
    }, []);

    const isActive = useMemo(
      () => selectedFolder === folder.id || foldersParent.includes(folder.id),
      [folder.id, foldersParent, selectedFolder]
    );

    // only the folders with depth = 0 can be selected
    const dataFolderSelect = useMemo(() => {
      return {
        "data-folder-select": folder.id,
        "data-selector": folder.id,
      };
    }, [folder.id]);

    const folderRef = useRef<HTMLDivElement>(null);

    const [selectorBounds] = useTriggerState({
      name: "selector_bounds",
      initial: {},
    });

    const isFolderSelected = useMemo(() => {
      if (selectorBounds == null) return false;

      if (folderRef.current == null) return false;

      const folderBounds = folderRef.current.getBoundingClientRect();

      const isY =
        folderBounds.bottom >= selectorBounds.top &&
        folderBounds.top <= selectorBounds.bottom;

      const isX =
        folderBounds.right >= selectorBounds.left &&
        folderBounds.left <= selectorBounds.right;

      return isY && isX;
    }, [selectorBounds]);

    useEffect(() => {
      const folders = stateStorage.get("explorer-selected-folders");

      if (isFolderSelected) {
        stateStorage.set("explorer-selected-folders", {
          ...folders,
          [folder.id]: true,
        });
      } else {
        delete folders[folder.id];

        stateStorage.set("explorer-selected-folders", {
          ...folders,
        });
      }
    }, [folder.id, isActive, isFolderSelected]);

    const { DragComponent } = useDrag({ ref: folderRef, id: folder.id });

    const [dragginHover] = useTriggerState({
      name: "folder_drag_hover",
      initial: false,
    });

    const isDraggingHover = useMemo(
      () => dragginHover == folder.id,
      [dragginHover, folder.id]
    );

    // add the folder ref
    useEffect(() => {
      const foldersRef = stateStorage.get("explorer-folders-ref");

      stateStorage.set("explorer-folders-ref", {
        ...foldersRef,
        [folder.id]: folderRef,
      });
    }, [folder.id]);

    return (
      <>
        {DragComponent()}

        {showRename ? (
          <NewFolder
            id={folder.id}
            onBlur={handleRenameFolder}
            prevValue={customName}
            depth={depth}
          />
        ) : (
          <ExplorerSt.Visualization.File
            ref={folderRef}
            {...dataFolderSelect}
            active={isActive || isDraggingHover}
            selected={selectedFile === folder.id || isFolderSelected}
            role="button"
            onContextMenu={handleMenu}
            onClick={handleFolderClick}
          >
            <ExplorerSt.Folder.Icon>
              {isOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
              {isOpen ? <FolderOpened /> : <FolderClosed />}
            </ExplorerSt.Folder.Icon>
            {customName}
          </ExplorerSt.Visualization.File>
        )}

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
            onRename={startRename}
            setShowContextMenu={setShowContextMenu}
            position={contextMenuRef.current}
            id={folder.id}
            parentId={parentId}
          />
        )}
      </>
    );
  }
);

Folder.displayName = "Folder";

const NewFolder = memo(
  ({
    isFile,
    id,
    prevValue,
    onBlur,
    depth = 0,
  }: {
    isFile?: boolean;
    id: number;
    prevValue?: string;
    onBlur?: (name: string) => void;
    depth?: number;
  }) => {
    const inputRef = useRef(null);
    const iconRef = useRef(null);
    const [lang] = useTriggerState({ name: "lang" });
    const router = useRouter();

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

        // opens the new file
        router.push(`/${lang}/scribere/${newScribere.id}`);
        return;
      }

      const newFolder = await CREATE_FOLDER({
        name,
        folderParentId: globalState.get("selected_folder"),
      });

      const folders = globalState.get(`explorer_folder_${id}`);
      folders.push(newFolder);

      stateStorage.set(`explorer_folder_${id}`, [...folders]);
    }, [id, isFile, lang, onBlur, router]);

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

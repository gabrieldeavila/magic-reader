import React from "react";
import ContextMenu from "../../../../ContextMenu/ContextMenu";
import { useGTTranslate } from "@geavila/gt-design";
import ContextMenuSt from "../../../../ContextMenu/style";

function FolderMenu({
  setShowContextMenu,
  position,
  onAddNewFolder,
  onAddNewFile,
  onRename
}: {
  setShowContextMenu: React.Dispatch<React.SetStateAction<boolean>>;
  position: { x: number; y: number };
  onAddNewFolder: () => void;
  onAddNewFile: () => void;
  onRename: () => void;
}) {
  const { translateThis } = useGTTranslate();

  return (
    <ContextMenu
      {...{
        setShowContextMenu,
        position,
      }}
    >
      <ContextMenuSt.Option.Wrapper onClick={onAddNewFolder}>
        <ContextMenuSt.Option.Title>
          {translateThis("SCRIBERE.NEW_FOLDER")}
        </ContextMenuSt.Option.Title>
      </ContextMenuSt.Option.Wrapper>
      <ContextMenuSt.Option.Wrapper onClick={onAddNewFile}>
        <ContextMenuSt.Option.Title>
          {translateThis("SCRIBERE.NEW_FILE")}
        </ContextMenuSt.Option.Title>
      </ContextMenuSt.Option.Wrapper>
      <ContextMenuSt.Divider />
      <ContextMenuSt.Option.Wrapper onClick={onRename}>
        <ContextMenuSt.Option.Title>
          {translateThis("SCRIBERE.RENAME")}
        </ContextMenuSt.Option.Title>
        <ContextMenuSt.Option.Shortcut>F2</ContextMenuSt.Option.Shortcut>
      </ContextMenuSt.Option.Wrapper>
      <ContextMenuSt.Option.Wrapper>
        <ContextMenuSt.Option.Title>
          {translateThis("SCRIBERE.DELETE")}
        </ContextMenuSt.Option.Title>
        <ContextMenuSt.Option.Shortcut>delete</ContextMenuSt.Option.Shortcut>
      </ContextMenuSt.Option.Wrapper>
    </ContextMenu>
  );
}

export default FolderMenu;

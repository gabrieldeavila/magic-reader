import React, { useCallback } from "react";
import ContextMenu from "../../../../ContextMenu/ContextMenu";
import { useGTTranslate } from "@geavila/gt-design";
import ContextMenuSt from "../../../../ContextMenu/style";

function FileMenu({
  setShowContextMenu,
  position,
  onRename,
}: {
  setShowContextMenu: React.Dispatch<React.SetStateAction<boolean>>;
  position: { x: number; y: number };
  onRename: () => void;
}) {
  const { translateThis } = useGTTranslate();

  const handleClose = useCallback(() => {
    setShowContextMenu(false);
  }, [setShowContextMenu]);

  return (
    <ContextMenu
      {...{
        setShowContextMenu,
        position,
      }}
    >
      <ContextMenuSt.Option.Wrapper>
        <ContextMenuSt.Option.Title>
          {translateThis("SCRIBERE.OPEN")}
        </ContextMenuSt.Option.Title>
      </ContextMenuSt.Option.Wrapper>
      <ContextMenuSt.Divider />
      <ContextMenuSt.Option.Wrapper
        onClick={() => {
          onRename();
          handleClose();
        }}
      >
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

export default FileMenu;

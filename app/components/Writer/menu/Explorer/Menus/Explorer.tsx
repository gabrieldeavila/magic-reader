import React, { useCallback, useMemo } from "react";
import ContextMenu from "../../../../ContextMenu/ContextMenu";
import { stateStorage, useTriggerState } from "react-trigger-state";
import ContextMenuSt from "../../../../ContextMenu/style";
import { useGTTranslate } from "@geavila/gt-design";

function ExplorerPortal() {
  const { translateThis } = useGTTranslate();
  const [showContextMenu, setShowContextMenu] = useTriggerState({
    name: "show_context_menu",
    initial: false,
  });

  const position = useMemo(() => {
    if (!showContextMenu) {
      return {
        x: 0,
        y: 0,
      };
    }

    return showContextMenu;
  }, [showContextMenu]);

  const handleNewFolder = useCallback(() => {
    setShowContextMenu(false);

    stateStorage.set("add_new_folder", true);
  }, [setShowContextMenu]);

  const handleNewFile = useCallback(() => {
    setShowContextMenu(false);

    stateStorage.set("show_add_new_file", true);
  }, [setShowContextMenu]);

  if (!showContextMenu) return null;

  return (
    <ContextMenu
      {...{
        setShowContextMenu,
        position,
      }}
    >
      <ContextMenuSt.Option.Wrapper onClick={handleNewFolder}>
        <ContextMenuSt.Option.Title>
          {translateThis("SCRIBERE.NEW_FOLDER")}
        </ContextMenuSt.Option.Title>
      </ContextMenuSt.Option.Wrapper>
      <ContextMenuSt.Option.Wrapper onClick={handleNewFile}>
        <ContextMenuSt.Option.Title>
          {translateThis("SCRIBERE.NEW_FILE")}
        </ContextMenuSt.Option.Title>
      </ContextMenuSt.Option.Wrapper>
    </ContextMenu>
  );
}

export default ExplorerPortal;

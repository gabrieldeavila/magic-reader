import {
  Button,
  GTModal,
  Space,
  Text,
  useGTTranslate,
} from "@geavila/gt-design";
import React, { useCallback, useRef, useState } from "react";
import ContextMenu from "../../../../ContextMenu/ContextMenu";
import ContextMenuSt from "../../../../ContextMenu/style";
import { IModalData } from "../../../../Reader/interface";
import { createPortal } from "react-dom";
import DELETE_SCRIBERE from "../../../_commands/file/DELETE.";
import useUpdateTabs from "../../../hooks/crud/useUpdateTabs";
import { globalState } from "react-trigger-state";

function FileMenu({
  setShowContextMenu,
  position,
  onRename,
  onOpen,
  id,
}: {
  setShowContextMenu: React.Dispatch<React.SetStateAction<boolean>>;
  position: { x: number; y: number };
  onRename: () => void;
  onOpen: () => void;
  id: number;
}) {
  const { translateThis } = useGTTranslate();

  const handleClose = useCallback(() => {
    setShowContextMenu(false);
  }, [setShowContextMenu]);

  const modalData = useRef<IModalData>({
    title: translateThis("SCRIBERE.WARNING"),
    orientationY: "center",
    orientationX: "center",
    onClose: handleClose,
  });

  const [showModalBasic, setShowModalBasic] = useState(false);

  const handleDelete = useCallback(() => {
    setShowModalBasic(true);
  }, []);

  const handleCancel = useCallback(() => {
    setShowModalBasic(false);
  }, []);

  const updateTabs = useUpdateTabs();

  const handleConfirm = useCallback(async () => {
    setShowModalBasic(false);
    await DELETE_SCRIBERE(id);
    updateTabs({
      isActive: id == globalState.get("active_tab"),
      id,
    });
  }, [id, updateTabs]);

  return (
    <ContextMenu
      {...{
        setShowContextMenu,
        position,
      }}
      avoidClose={showModalBasic}
    >
      <ContextMenuSt.Option.Wrapper onClick={onOpen}>
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
      <ContextMenuSt.Option.Wrapper onClick={handleDelete}>
        <ContextMenuSt.Option.Title>
          {translateThis("SCRIBERE.DELETE")}
        </ContextMenuSt.Option.Title>
        <ContextMenuSt.Option.Shortcut>delete</ContextMenuSt.Option.Shortcut>
      </ContextMenuSt.Option.Wrapper>

      {createPortal(
        <GTModal
          data={modalData.current}
          show={showModalBasic}
          setShow={setShowModalBasic}
        >
          <Space.Center mb="1rem">
            <Text.H2>{translateThis("SCRIBERE.THIS_ACTION")}</Text.H2>
          </Space.Center>
          <Space.Between style={{ gap: "0.5rem" }}>
            <Button.Success onClick={handleCancel}>
              {translateThis("SCRIBERE.CANCEL")}
            </Button.Success>

            <Button.Error onClick={handleConfirm}>
              {translateThis("SCRIBERE.DELETE")}
            </Button.Error>
          </Space.Between>
        </GTModal>,
        document.body
      )}
    </ContextMenu>
  );
}

export default FileMenu;

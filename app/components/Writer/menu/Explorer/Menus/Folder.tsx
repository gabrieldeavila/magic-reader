import React, { useCallback, useRef, useState } from "react";
import ContextMenu from "../../../../ContextMenu/ContextMenu";
import {
  Button,
  GTModal,
  Space,
  Text,
  useGTTranslate,
} from "@geavila/gt-design";
import ContextMenuSt from "../../../../ContextMenu/style";
import { IModalData } from "../../../../Reader/interface";
import { createPortal } from "react-dom";
import DELETE_FOLDER from "../../../_commands/folder/DELETE";
import useUpdateTabs from "../../../hooks/crud/useUpdateTabs";
import { globalState, stateStorage } from "react-trigger-state";

function FolderMenu({
  setShowContextMenu,
  position,
  onAddNewFolder,
  onAddNewFile,
  onRename,
  id,
  parentId,
}: {
  setShowContextMenu: React.Dispatch<React.SetStateAction<boolean>>;
  position: { x: number; y: number };
  onAddNewFolder: () => void;
  onAddNewFile: () => void;
  onRename: () => void;
  id: number;
  parentId: number;
}) {
  const { translateThis } = useGTTranslate();
  const [showModalBasic, setShowModalBasic] = useState(false);

  const handleClose = useCallback(() => {
    setShowContextMenu(false);
  }, [setShowContextMenu]);

  const modalData = useRef<IModalData>({
    title: translateThis("SCRIBERE.WARNING"),
    orientationY: "center",
    orientationX: "center",
    onClose: handleClose,
  });

  const handleCancel = useCallback(() => {
    setShowModalBasic(false);
  }, []);

  const updateTabs = useUpdateTabs();

  const handleConfirm = useCallback(async () => {
    setShowModalBasic(false);
    await DELETE_FOLDER({ id });

    // if there is an active tab, it is the last one
    const scriberesDeleted = globalState.get("scriberes_deleted") || [];

    let active;

    scriberesDeleted.forEach((scribereId: number) => {
      const isActive = scribereId == globalState.get("active_tab");

      if (isActive) {
        active = scribereId;
        return;
      }

      updateTabs({
        isActive: false,
        id: scribereId,
      });
    });

    if (active) {
      updateTabs({
        isActive: true,
        id: active,
      });
    }

    // removes from the parent folder
    const currentParent = globalState.get(`explorer_folder_${parentId}`);

    if (currentParent) {
      stateStorage.set(
        `explorer_folder_${parentId}`,
        currentParent.filter(
          ({ id: scribereId }: { id: number }) => scribereId != id
        )
      );
    }
  }, [id, parentId, updateTabs]);

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
      <ContextMenuSt.Option.Wrapper
        onClick={() => {
          setShowModalBasic(true);
        }}
      >
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
          {/* @ts-expect-error gt-design gottta fix it */}
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

export default FolderMenu;

import { memo, useCallback, useEffect, useState } from "react";
import { ChevronRight, FilePlus, FolderPlus } from "react-feather";
import { Scribere, db } from "../../../Dexie/Dexie";
import MenuSt from "../style";
import { Space, useGTTranslate } from "@geavila/gt-design";
import { stateStorage, useTriggerState } from "react-trigger-state";
import FolderOpened from "./FolderOpened";
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

  const [showAddNewFolder, setShowAddNewFolder] = useState(false);

  useEffect(() => {
    if (addNewFilter == null) return;

    setAddNewFilter(null);
    setShowAddNewFolder(true);
  }, [addNewFilter, setAddNewFilter]);

  useEffect(() => {
    (async () => {
      const val = await db.scribere.where("folderId").equals(-1).toArray();

      setScribere(val);
    })();
  }, []);

  return (
    <div>
      {scribere.map((scribere, index) => {
        return <div key={index}>{scribere.name}</div>;
      })}

      {showAddNewFolder && <NewFolder />}
    </div>
  );
});

ExplorerContent.displayName = "ExplorerContent";

const NewFolder = memo(() => {
  return (
    <ExplorerSt.Folder.Wrapper>
      <ExplorerSt.Folder.Container>
        <Space.Modifiers dir="row">
          <ChevronRight size={12} />
          <FolderClosed />
        </Space.Modifiers>

        <ExplorerSt.Folder.Input.Content>
          <ExplorerSt.Folder.Input.Input />
        </ExplorerSt.Folder.Input.Content>
      </ExplorerSt.Folder.Container>
    </ExplorerSt.Folder.Wrapper>
  );
});

NewFolder.displayName = "NewFolder";

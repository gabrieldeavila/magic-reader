import { useCallback, useEffect } from "react";
import { stateStorage, useTriggerState } from "react-trigger-state";
import { db } from "../../../Dexie/Dexie";

function useFoldersParents() {
  const [activeTab] = useTriggerState({ name: "active_tab" });

  const getParentFolder = useCallback(async (id: number) => {
    const folder = await db.folders.get(id);

    if (folder) {
      return folder.folderParentId;
    }

    return null;
  }, []);

  useEffect(() => {
    (async () => {
      let noParent = false;
      if (!activeTab) {
        stateStorage.set("folders_parents", []);
        return;
      }

      let parentId = (await db.scribere.get(activeTab)).folderId;
      parentId = parentId === -1 ? null : parentId;

      const folders = [];

      if (parentId) {
        folders.push(parentId);
      }

      while (!noParent && parentId) {
        const parent = await getParentFolder(parentId);

        parentId = parent;

        if (parent !== -1 && parent) {
          folders.push(parent);
        } else {
          noParent = true;
        }
      }

      stateStorage.set("folders_parents", folders);
    })();
  }, [activeTab, getParentFolder]);
}

export default useFoldersParents;

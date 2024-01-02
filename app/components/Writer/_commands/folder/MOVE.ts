import { db } from "../../../Dexie/Dexie";

const MOVE_FOLDER = (folderId: string, toFolderId: string) => {
  return db.folders
    .where("id")
    .equals(parseInt(folderId))
    .modify({ folderParentId: parseInt(toFolderId) });
};

export default MOVE_FOLDER;

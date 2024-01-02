import { db } from "../../../Dexie/Dexie";

const MOVE_FILE = async (fileId: string, toFolderId: string) => {
  return db.scribere
    .where("id")
    .equals(parseInt(fileId))
    .modify({ folderId: parseInt(toFolderId) });
};

export default MOVE_FILE;

import { globalState, stateStorage } from "react-trigger-state";
import { db } from "../../../Dexie/Dexie";

const DELETE_SCRIBERE = async (id: string | number) => {
  id = typeof id !== "number" ? parseInt(id) : id;
  const data = await db.scribere.get(id);

  await db.scribere.delete(id);

  const folderKey = `explorer_scribere_${data.folderId || -1}`;

  // remove scribere from folder
  const folderScriberes = globalState.get(folderKey);

  const newFolderScriberes = folderScriberes.filter(
    (scribere: any) => scribere.id != id
  );

  stateStorage.set(folderKey, [...newFolderScriberes]);
};

export default DELETE_SCRIBERE;

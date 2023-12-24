import { globalState } from "react-trigger-state";
import { db } from "../../../Dexie/Dexie";
import DELETE_SCRIBERE from "../file/DELETE.";

const DELETE_FOLDER = async ({ id }: { id: number }) => {
  const folder = await db.folders.get(id);

  if (!folder) {
    throw new Error(`Folder with id ${id} does not exist`);
  }

  const children = await db.folders.where({ folderParentId: id }).toArray();

  if (children.length > 0) {
    await DELETE_FOLDER_CHILDREN({ id });
  }

  const scriberes = await db.scribere.where({ folderId: id }).toArray();

  if (scriberes.length > 0) {
    for (const scribere of scriberes) {
      DELETE_SCRIBERE(scribere.id);
    }

    const scriberesDeleted = scriberes.map((scribere) => scribere.id);
    const currentScriberes = globalState.get("scriberes_deleted") || [];

    globalState.set("scriberes_deleted", [
      ...currentScriberes,
      ...scriberesDeleted,
    ]);
  }

  await db.folders.delete(id);

  return folder;
};

export default DELETE_FOLDER;

const DELETE_FOLDER_CHILDREN = async ({ id }: { id: number }) => {
  const children = await db.folders.where({ folderParentId: id }).toArray();

  if (children.length === 0) {
    return;
  }

  for (const child of children) {
    await DELETE_FOLDER({ id: child.id });
  }
};

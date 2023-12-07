import { db } from "../../../Dexie/Dexie";

const CREATE_FOLDER = async ({
  name,
  folderParentId = -1,
}: {
  name: string;
  folderParentId?: number;
}) => {
  const id = await db.folders.add({
    name,
    folderParentId,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return id;
};

export default CREATE_FOLDER;

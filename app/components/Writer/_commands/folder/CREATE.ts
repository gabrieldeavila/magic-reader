import { db } from "../../../Dexie/Dexie";

const CREATE_FOLDER = async ({
  name,
  folderParentId = -1,
}: {
  name: string;
  folderParentId?: number;
}) => {
  const folder = {
    name,
    folderParentId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const id = await db.folders.add(folder);

  const newFolder = {
    ...folder,
    id,
  };

  return newFolder;
};

export default CREATE_FOLDER;

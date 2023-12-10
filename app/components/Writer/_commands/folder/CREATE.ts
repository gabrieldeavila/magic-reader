import { db } from "../../../Dexie/Dexie";

const CREATE_FOLDER = async ({
  name,
  folderParentId = -1,
}: {
  name: string;
  folderParentId?: number;
}) => {
  const newFolder = {
    name,
    folderParentId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const id = await db.folders.add(newFolder);

  // @ts-expect-error id is not defined
  newFolder.id = id;

  return newFolder;
};

export default CREATE_FOLDER;

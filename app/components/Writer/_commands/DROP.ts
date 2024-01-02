import MOVE_FILE from "./file/MOVE";
import MOVE_FOLDER from "./folder/MOVE";

const DROP = ({
  toFolderId,
  filesId,
  foldersIds,
}: {
  toFolderId: string;
  filesId: string[];
  foldersIds: string[];
}) => {
  foldersIds.forEach((folderId) => {
    MOVE_FOLDER(folderId, toFolderId);
  });

  filesId.forEach((fileId) => {
    MOVE_FILE(fileId, toFolderId);
  });
};

export default DROP;

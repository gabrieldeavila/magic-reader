import uuid from "../../../../utils/uuid";
import { db } from "../../../Dexie/Dexie";
import { IWritterContent } from "../../interface";
import randomEmoji from "../../utils/randomEmoji";
import RANDOM_COLOR, { RANDOM_DEGREES } from "../color/RANDOM";

export const initialContent: IWritterContent[] = [
  {
    id: uuid(),
    type: "p",
    align: "left",
    text: [
      {
        value: "",
        options: [],
        id: uuid(),
      },
    ],
  },
];

const CREATE_SCRIBERE = async (name?: string, folderId?: number) => {
  const scribere = {
    name: name || "--",
    content: initialContent,
    folderId: folderId || -1,
    img: {
      top: RANDOM_COLOR(),
      bottom: RANDOM_COLOR(),
      deg: RANDOM_DEGREES(),
    },
    position: 0,
    emoji: randomEmoji(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const id = await db.scribere.add(scribere);

  const newScribere = {
    ...scribere,
    id,
  };

  return newScribere;
};

export default CREATE_SCRIBERE;

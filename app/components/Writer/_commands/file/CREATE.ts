import uuid from "../../../../utils/uuid";
import { db } from "../../../Dexie/Dexie";
import { IWritterContent } from "../../interface";

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
    name: name || "",
    content: initialContent,
    folderId: folderId || -1,
    img: "https://images.unsplash.com/photo-1607970669494-309137683be5",
    position: { x: 0, y: 0 },
    emoji: "📝",
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

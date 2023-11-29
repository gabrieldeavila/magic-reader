import uuid from "../../../utils/uuid";
import { db } from "../../Dexie/Dexie";
import { IWritterContent } from "../interface";

const initialContent: IWritterContent[] = [
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

const CREATE_SCRIBERE = async () => {
  const id = await db.scribere.add({
    name: "Untitled",
    content: initialContent,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return id;
};

export default CREATE_SCRIBERE;

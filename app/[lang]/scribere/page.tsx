import Writer from "../../components/Writer/Writer";
import { IWritterContent } from "../../components/Writer/interface";
import uuid from "../../utils/uuid";

const DEFAULT_CONTENT: IWritterContent[] = [
  {
    id: uuid(),
    text: [
      {
        value: "Hello ",
        options: [],
        id: uuid(),
      },
      {
        value: "World",
        options: ["bold"],
        id: uuid(),
      },
      {
        value: " hehe",
        options: [],
        id: uuid(),
      },
      {
        value: " const a = b === c",
        options: ["code"],
        id: uuid(),
      },
    ],
  },
  {
    id: uuid(),
    text: [
      {
        value: "111",
        options: [],
        id: uuid(),
      },
    ],
  },
  {
    id: uuid(),
    text: [
      {
        value: "2222",
        options: [],
        id: uuid(),
      },
    ],
  },
];

function Scribere() {
  return <Writer content={DEFAULT_CONTENT} />;
}

export default Scribere;

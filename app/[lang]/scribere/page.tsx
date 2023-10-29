import Writer from "../../components/Writer/Writer";
import { IWritterContent } from "../../components/Writer/interface";
import uuid from "../../utils/uuid";

const DEFAULT_CONTENT: IWritterContent[] = [
  {
    id: uuid(),
    type: "h1",
    text: [
      {
        value: "Title 1!",
        options: [],
        id: uuid(),
      },
    ],
  },
  {
    id: uuid(),
    type: "h2",
    text: [
      {
        value: "Code Example",
        options: [],
        id: uuid(),
      },
    ],
  },
  {
    id: uuid(),
    type: "p",
    text: [
      {
        value: "Next is a code ",
        options: ["bold"],
        id: uuid(),
      },
      {
        value: "const a = b === c",
        options: ["code"],
        id: uuid(),
      },
    ],
  },
  {
    id: uuid(),
    type: "h2",
    text: [
      {
        value: "Todo List",
        options: [],
        id: uuid(),
      },
    ],
  },
  {
    id: uuid(),
    type: "tl",
    text: [
      {
        value: "Do something",
        options: [],
        id: uuid(),
      },
    ],
  },
  {
    id: uuid(),
    type: "tl",
    text: [
      {
        value: "Do another thing....",
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

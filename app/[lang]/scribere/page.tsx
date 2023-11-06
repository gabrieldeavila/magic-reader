import Writer from "../../components/Writer/Writer";
import { IWritterContent } from "../../components/Writer/interface";
import uuid from "../../utils/uuid";

const DEFAULT_CONTENT: IWritterContent[] = [
  {
    id: uuid(),
    type: "h1",
    align: "center",
    text: [
      {
        value: "This is Scribere",
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
        value: "",
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
        value: "Basic",
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
        value: "Never ",
        options: ["highlight"],
        id: uuid(),
      },
      {
        value: "gonna ",
        options: ["bold"],
        id: uuid(),
      },
      {
        value: "give",
        options: ["italic"],
        id: uuid(),
      },
      {
        value: " you",
        options: ["underline"],
        id: uuid(),
      },
      {
        value: " up",
        options: ["strikethrough"],
        id: uuid(),
      },
    ],
  },
  {
    id: uuid(),
    type: "p",
    text: [
      {
        value: "",
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
        value: "Link",
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
        value: "Click in me!",
        custom: {
          link: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        },
        options: ["external_link"],
        id: uuid(),
      },
    ],
  },
  {
    id: uuid(),
    type: "p",
    text: [
      {
        value: "",
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
        value: "Code",
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
        options: [],
        id: uuid(),
      },
      {
        value: "const a = b === c",
        options: ["code", "bold"],
        id: uuid(),
      },
    ],
  },
  {
    id: uuid(),
    type: "p",
    text: [
      {
        value: "",
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
        value: "Clean the house",
        options: ["italic"],
        id: uuid(),
      },
    ],
  },
  {
    id: uuid(),
    type: "tl",
    customStyle: {
      checked: true,
    },
    text: [
      {
        value: "Buy groceries",
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
        value: "",
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
        value: "Numbered List",
        options: [],
        id: uuid(),
      },
    ],
  },
  {
    id: uuid(),
    type: "nl",
    text: [
      {
        value: "Go outside",
        options: [],
        id: uuid(),
      },
    ],
  },
  {
    id: uuid(),
    type: "nl",
    text: [
      {
        value: "Go back inside",
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
        value: "",
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
        value: "Bullet list",
        options: [],
        id: uuid(),
      },
    ],
  },
  {
    id: uuid(),
    type: "bl",
    text: [
      {
        value: "Something",
        options: [],
        id: uuid(),
      },
    ],
  },
  {
    id: uuid(),
    type: "bl",
    text: [
      {
        value: "Something 2",
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

import Writer from "../../components/Writer/Writer";
import { IWritterContent } from "../../components/Writer/interface";

const DEFAULT_CONTENT: IWritterContent[] = [
  {
    text: [
      {
        value: "Hello ",
        options: [],
        id: 1,
      },
      {
        value: "World",
        options: ["bold"],
        id: 2
      }
    ],
  },
];

function page() {
  return <Writer content={DEFAULT_CONTENT} />;
}

export default page;

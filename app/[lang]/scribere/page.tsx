import Writer from "../../components/Writer/Writer";
import { IWritterContent } from "../../components/Writer/interface";

const DEFAULT_CONTENT: IWritterContent[] = [
  {
    text: [
      {
        value: "Hello ",
        options: []
      },
      {
        value: "World",
        options: ["bold"]
      }
    ],
  },
];

function page() {
  return <Writer content={DEFAULT_CONTENT} />;
}

export default page;

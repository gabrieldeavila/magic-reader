import Writer from "../../components/Writer/Writer";
import { IWritterContent } from "../../components/Writer/interface";

const DEFAULT_CONTENT: IWritterContent[] = [
  {
    type: "p",
    text: "This is editable!",
  },
];

function page() {
  return <Writer content={DEFAULT_CONTENT} />;
}

export default page;

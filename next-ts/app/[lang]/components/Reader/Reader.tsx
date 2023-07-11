import { Space } from "@geavila/gt-design";
import { useTriggerState } from "react-trigger-state";
import Phrase from "./Phrase";

function Reader() {
  const [pdf] = useTriggerState({ name: "pdf", initial: [] });

  return (
    <Space.Modifiers flexWrap="wrap">
      {pdf.map((phrase: string, index: number) => (
        <Phrase key={index} index={index} phrase={phrase} />
      ))}
    </Space.Modifiers>
  );
}

export default Reader;

import { ChevronDown } from "react-feather";
import { Select } from "./style";
import { useGTTranslate } from "@geavila/gt-design";

const OPTIONS = [
  {
    key: "P",
    label: "SCRIBERE.P",
  },
  {
    key: "H1",
    label: "SCRIBERE.H1",
  },
  {
    key: "H2",
    label: "SCRIBERE.H2",
  },
  {
    key: "H3",
    label: "SCRIBERE.H3",
  },
  {
    key: "BL",
    label: "SCRIBERE.BL",
  },
  {
    key: "NL",
    label: "SCRIBERE.NL",
  },
  {
    key: "TL",
    label: "SCRIBERE.TL",
  },
  {
    key: "AC",
    label: "SCRIBERE.AC",
  },
];

function PopupSelect() {
  const { translateThis } = useGTTranslate();

  return (
    <>
      <Select.Wrapper>
        <Select.Container>
          <Select.Selected>Text</Select.Selected>
          <ChevronDown size={12} />
        </Select.Container>
      </Select.Wrapper>

      <Select.Options>
        <Select.Info>{translateThis("SCRIBERE.TURN_INTO")}</Select.Info>

        {OPTIONS.map((option) => (
          <Select.Option key={option.key}>
            {translateThis(option.label)}
          </Select.Option>
        ))}
      </Select.Options>
    </>
  );
}

export default PopupSelect;

import { ChevronDown } from "react-feather";
import { Select } from "./style";
import { useGTTranslate } from "@geavila/gt-design";
import { useCallback, useState } from "react";
import useGetCurrBlockId from "../../hooks/useGetCurrBlockId";
import { useContextName } from "../../context/WriterContext";
import { globalState, stateStorage } from "react-trigger-state";

const OPTIONS = [
  {
    key: "p",
    label: "SCRIBERE.P",
  },
  {
    key: "h1",
    label: "SCRIBERE.H1",
  },
  {
    key: "h2",
    label: "SCRIBERE.H2",
  },
  {
    key: "h3",
    label: "SCRIBERE.H3",
  },
  {
    key: "bl",
    label: "SCRIBERE.BL",
  },
  {
    key: "nl",
    label: "SCRIBERE.NL",
  },
  {
    key: "tl",
    label: "SCRIBERE.TL",
  },
  {
    key: "ac",
    label: "SCRIBERE.AC",
  },
];

function PopupSelect() {
  const { translateThis } = useGTTranslate();
  const [show, setShow] = useState(false);
  const contextName = useContextName();

  const handleShow = useCallback(() => {
    setShow((prev) => !prev);
  }, []);

  const { getBlockId } = useGetCurrBlockId();

  const handleChange = useCallback(
    (option: string) => {
      const { dataLineId } = getBlockId({});

      const content = globalState.get(contextName).map((line) => {
        if (line.id === dataLineId) {
          return {
            ...line,
            type: option,
          };
        }

        return line;
      });

      stateStorage.set(contextName, content);
    },
    [contextName, getBlockId]
  );

  return (
    <>
      <Select.Wrapper>
        <Select.Container onClick={handleShow}>
          <Select.Selected>Text</Select.Selected>
          <ChevronDown size={12} />
        </Select.Container>
      </Select.Wrapper>

      <Select.Options show={show}>
        <Select.Info>{translateThis("SCRIBERE.TURN_INTO")}</Select.Info>

        {OPTIONS.map((option) => (
          <Select.Option
            onClick={() => handleChange(option.key)}
            key={option.key}
          >
            {translateThis(option.label)}
          </Select.Option>
        ))}
      </Select.Options>
    </>
  );
}

export default PopupSelect;

import { memo, useCallback, useMemo } from "react";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  ChevronDown,
} from "react-feather";
import { globalState, stateStorage } from "react-trigger-state";
import { useContextName } from "../../context/WriterContext";
import { IWritterContent } from "../../interface";
import { AlignOption, AlignOptions, AlignWrapper } from "./style";

const OPTIONS = {
  left: AlignLeft,
  center: AlignCenter,
  right: AlignRight,
  justify: AlignJustify,
};

function Align({
  align,
  id,
}: {
  id: string;
  align?: IWritterContent["align"];
}) {
  const Selected = useMemo(() => OPTIONS[align ?? "left"], [align]);

  return (
    <>
      <AlignWrapper>
        <Selected size={15} />

        <ChevronDown size={13} />
      </AlignWrapper>

      <AlignOptions>
        {Object.keys(OPTIONS).map((key: keyof typeof OPTIONS) => (
          <AlignItem key={key} option={key} id={id} align={align} />
        ))}
      </AlignOptions>
    </>
  );
}

export default Align;

const AlignItem = memo(
  ({
    option,
    align,
    id,
  }: {
    id: string;
    option: keyof typeof OPTIONS;
    align: IWritterContent["align"];
  }) => {
    const Icon = OPTIONS[option];
    const contextName = useContextName();

    const handleClick = useCallback(() => {
      const content = globalState.get(contextName);

      const newContent = content.map((line) => {
        if (line.id === id) {
          return {
            ...line,
            align: option,
          };
        }

        return line;
      });

      stateStorage.set(contextName, newContent);
    }, [contextName, id, option]);

    return (
      <AlignOption onClick={handleClick} disabled={option === align}>
        <Icon size={15} />
      </AlignOption>
    );
  }
);

AlignItem.displayName = "AlignItem";

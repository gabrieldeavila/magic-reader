import { useMemo } from "react";
import { Check } from "react-feather";
import {
  globalState,
  stateStorage,
  useTriggerState,
} from "react-trigger-state";
import { useContextName } from "../context/WriterContext";
import { IWritterContent, scribereActions } from "../interface";
import { TodoButton } from "../style";

function useCustomComps({
  id,
  type,
  customStyle,
}: {
  id: string;
  type: scribereActions;
  customStyle?: IWritterContent["customStyle"];
}) {
  const contextName = useContextName();
  const [update] = useTriggerState({ name: `update_${type}` });

  const customProps = useMemo(() => {
    if (type === "nl") {
      const content = globalState.get(contextName);

      const position = content.findIndex((item) => item.id === id);

      let number = 1;
      let tempPosition = position;
      let reached = false;
      while (tempPosition > 0 && !reached) {
        tempPosition--;
        if (content[tempPosition].type === "nl") {
          number++;
        } else {
          reached = true;
        }
      }

      return { ["data-placeholder-number"]: number };
    }

    if (type === "tl") {
      return {
        style: {
          textDecoration: customStyle?.checked ? "line-through" : "none",
        },
      };
    }

    return {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contextName, id, type, update, customStyle]);

  const customComp = useMemo(() => {
    if (type === "tl") {
      return (
        <TodoButton
          data-todo
          onClick={() => {
            const content = globalState.get(contextName);

            const newContent = content.map((item) => {
              if (item.id === id) {
                return {
                  ...item,
                  customStyle: {
                    ...item.customStyle,
                    checked: !item.customStyle?.checked,
                  },
                };
              }

              return item;
            });

            stateStorage.set(contextName, newContent);
          }}
        >
          {customStyle?.checked && (
            <Check data-todo size={12} stroke="var(--info)" />
          )}
        </TodoButton>
      );
    }

    return null;
  }, [contextName, customStyle?.checked, id, type]);

  return { customProps, customComp };
}

export default useCustomComps;

import { useMemo } from "react";
import { globalState, useTriggerState } from "react-trigger-state";
import { useContextName } from "../context/WriterContext";
import { scribereActions } from "../interface";
import { TodoButton } from "../style";
import { Check } from "react-feather";

function useCustomComps({ id, type }: { id: string; type: scribereActions }) {
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

    return {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contextName, id, type, update]);

  const customComp = useMemo(() => {
    if (type === "tl") {
      return (
        <TodoButton>
          <Check size={12} stroke="var(--info)" />
        </TodoButton>
      );
    }

    return null;
  }, [type]);

  return { customProps, customComp };
}

export default useCustomComps;

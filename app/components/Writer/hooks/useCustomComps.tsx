import { useCallback, useEffect, useMemo, useRef } from "react";
import { Check } from "react-feather";
import {
  globalState,
  stateStorage,
  useTriggerState,
} from "react-trigger-state";
import { useContextName } from "../context/WriterContext";
import { IKeys, IWritterContent, scribereActions } from "../interface";
import { TodoButton } from "../style";

function useCustomComps({
  id,
  type,
  customStyle,
  align,
}: {
  id: string;
  type: scribereActions;
  customStyle?: IWritterContent["customStyle"];
  align?: IWritterContent["align"];
}) {
  const contextName = useContextName();
  const [update] = useTriggerState({ name: `update_${type}` });

  const customProps = useMemo(() => {
    let props: IKeys = {
      "data-component": type,
      style: {
        textAlign: align ?? "left",
      },
    };

    if (["h1", "h2", "h3"].includes(type)) {
      // adds an anchor to the header, so it can be linked
      props = {
        ...props,
        id,
      };
    } else if (type === "nl") {
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

      props = {
        ...props,
        ["data-placeholder-number"]: number,
      };
    } else if (type === "tl") {
      props = {
        ...props,
        style: {
          ...props.style,
          textDecoration:
            customStyle && "checked" in customStyle && customStyle.checked
              ? "line-through"
              : "none",
        },
      };
    }

    return props;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contextName, id, type, update, customStyle, align]);

  const handleClick = useCallback(() => {
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
  }, [contextName, id]);

  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (type !== "tl") return;
    const handler = (e) => {
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        const selection = window.getSelection();
        if (selection.toString().length > 0) return;

        // if the selection is not of the current block, don't do anything
        const contains =
          selection.anchorNode.parentElement.previousSibling?.contains(
            ref.current
          );

        if (!contains) return;

        setTimeout(() => {
          const hasBlock =
            selection?.focusNode?.parentElement?.hasAttribute("data-block-id");

          if (hasBlock) return;

          // add the focus to the closest block
          const closestBlock =
            (e.key === "ArrowLeft"
              ? (
                  ref.current.parentElement?.previousSibling as HTMLElement
                )?.querySelector("[data-block-id]")
              : (
                  ref.current.parentElement?.nextSibling as HTMLElement
                )?.querySelector("[data-block-id]")) || ref.current.nextSibling;

          // only to the first letter
          if (closestBlock?.firstChild) {
            const range = document.createRange();
            if (e.key === "ArrowRight") {
              range.setStart(closestBlock.firstChild, 0);
            } else {
              range.setStart(
                closestBlock.firstChild,
                closestBlock.firstChild.textContent.length
              );
            }

            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
          }
        });
      }
    };

    // prevent from the cursor to be placed inside the todo
    window.addEventListener("keydown", handler);

    return () => window.removeEventListener("keydown", handler);
  }, [type]);

  const customComp = useMemo(() => {
    if (type === "tl") {
      return (
        <TodoButton
          ref={ref}
          data-todo
          contentEditable={false}
          onClick={handleClick}
        >
          {customStyle && "checked" in customStyle && customStyle.checked && (
            <Check data-todo-checked data-todo size={12} stroke="var(--info)" />
          )}
        </TodoButton>
      );
    }

    return null;
  }, [customStyle, handleClick, type]);

  return { customProps, customComp };
}

export default useCustomComps;

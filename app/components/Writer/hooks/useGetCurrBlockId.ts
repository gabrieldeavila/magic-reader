import { useCallback } from "react";
import { globalState } from "react-trigger-state";
import { useWriterContext } from "../context/WriterContext";

function useGetCurrBlockId() {
  const { contextName } = useWriterContext();

  const getBlockId = useCallback(
    ({ textId }: { textId?: string }) => {
      const selection = window.getSelection();

      // get the closest data-scribere
      const closestScribere =
        selection.anchorNode?.parentElement?.closest?.("[data-scribere]");

      const dataLineId =
        textId ||
        closestScribere?.getAttribute?.("data-line-id") ||
        // @ts-expect-error - we know that anchorNode is not null
        selection.anchorNode?.getAttribute?.("data-line-id");

      const currText = !textId
        ? null
        : globalState.get(contextName).find(({ id }) => id === dataLineId)
            ?.text;

      let changedBlockId =
        selection.anchorNode?.parentElement?.getAttribute?.("data-block-id") ||
        currText?.[0]?.id;

      let currSelection = selection.anchorOffset;

      const isCodeBlock =
        selection.anchorNode?.parentElement?.parentElement?.tagName ===
          "CODE" ||
        // @ts-expect-error - we know that anchorNode is not null
        selection.anchorNode?.tagName === "CODE";

      if (isCodeBlock) {
        changedBlockId =
          selection.anchorNode.parentElement.parentElement.parentElement.parentElement.getAttribute(
            "data-block-id"
          ) ||
          selection.anchorNode.parentElement.parentElement.getAttribute(
            "data-block-id"
          );

        const codeChilds = Array.from(
          selection.anchorNode.parentElement?.parentElement.childNodes
        );

        currSelection = 0;

        codeChilds.find((item) => {
          if (item !== selection.anchorNode.parentElement) {
            currSelection += item.textContent?.length ?? 0;
            return false;
          }

          return true;
        });

        currSelection += selection.anchorOffset;
      }

      return {
        changedBlockId,
        currSelection,
        isCodeBlock,
        closestScribere,
        dataLineId,
      };
    },
    [contextName]
  );

  return { getBlockId };
}

export default useGetCurrBlockId;

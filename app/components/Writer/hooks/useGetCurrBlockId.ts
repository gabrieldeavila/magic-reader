import { useCallback } from "react";
import { globalState } from "react-trigger-state";
import { useWriterContext } from "../context/WriterContext";

function useGetCurrBlockId() {
  const { contextName } = useWriterContext();

  const getBlockId = useCallback(({ textId }: { textId: number }) => {
    const selection = window.getSelection();
    const currText = globalState
      .get(contextName)
      .find(({ id }) => id === textId).text;

    let changedBlockId = parseFloat(
      selection.anchorNode.parentElement.getAttribute("data-block-id") ||
        currText[0].id
    );

    let currSelection = selection.anchorOffset;

    const isCodeBlock =
      selection.anchorNode.parentElement?.parentElement.tagName === "CODE" ||
      // @ts-expect-error - we know that anchorNode is not null
      selection.anchorNode?.tagName === "CODE";

    if (isCodeBlock) {
      changedBlockId = parseFloat(
        selection.anchorNode.parentElement.parentElement.parentElement.parentElement.getAttribute(
          "data-block-id"
        ) ||
          selection.anchorNode.parentElement.parentElement.getAttribute(
            "data-block-id"
          )
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

    return { changedBlockId, currSelection, isCodeBlock };
  }, [contextName]);

  return { getBlockId };
}

export default useGetCurrBlockId;

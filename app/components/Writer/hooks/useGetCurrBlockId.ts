import { useCallback } from "react";

function useGetCurrBlockId() {
  const getBlockId = useCallback(() => {
    const selection = window.getSelection();

    let changedBlockId = parseFloat(
      selection.anchorNode.parentElement.getAttribute("data-block-id")
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

    console.log(isCodeBlock, changedBlockId, selection.anchorNode);

    return { changedBlockId, currSelection };
  }, []);

  return { getBlockId };
}

export default useGetCurrBlockId;

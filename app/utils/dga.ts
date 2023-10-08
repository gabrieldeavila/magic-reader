/**
 * Returns the anchor offset of the current selection, taking into account if the selection is within a code block.
 * @returns The anchor offset of the current selection.
 */
// dissolutus get anchor
export const dga = () => {
  const selection = window.getSelection();
  const isCodeBlock =
    selection.anchorNode.parentElement?.parentElement.tagName === "CODE";
  let anchorOffset = selection?.anchorOffset;

  if (isCodeBlock) {
    const codeChilds = Array.from(
      selection.anchorNode.parentElement?.parentElement.childNodes
    );

    let codeNewIndex = 0;

    codeChilds.find((item) => {
      if (item !== selection.anchorNode.parentElement) {
        codeNewIndex += item.textContent?.length ?? 0;
        return false;
      }

      return true;
    });

    codeNewIndex += selection.anchorOffset;

    anchorOffset = codeNewIndex;
  }

  return anchorOffset;
};

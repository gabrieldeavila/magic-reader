// dissolutus get selection

/**
 * Returns the start and end positions of the selected text.
 * @returns An array containing the start and end positions of the selected text.
 */
export const dgs = () => {
  // gets the position of the selected text
  const selection = window.getSelection();

  let anchor = selection.anchorNode?.parentElement;
  let focus = selection.focusNode?.parentElement;
  let anchorOffset = selection.anchorOffset;
  let focusOffset = selection.focusOffset;

  if (anchor.dataset.blockId == null) {
    const newAnchor = anchor.closest("[data-block-id]") as HTMLElement;
    // gets the children of the block
    const children =
      Array.from(newAnchor?.querySelector("code")?.children) || [];
    let newOffset = 0;
    let found = false;

    children.forEach((child) => {
      if (child.contains(anchor)) {
        found = true;
        newOffset += selection.anchorOffset;
      } else if (!found) {
        newOffset += child.textContent?.length || 0;
      }
    });

    anchor = newAnchor;
    anchorOffset = newOffset;
  }

  if (focus.dataset.blockId == null) {
    const newFocus = focus.closest("[data-block-id]") as HTMLElement;

    // gets the children of the block
    const children = Array.from(newFocus?.querySelector("code")?.children);
    let newOffset = 0;
    let found = false;

    children.forEach((child) => {
      if (child.contains(focus)) {
        found = true;
        newOffset += selection.focusOffset;
      } else if (!found) {
        newOffset += child.textContent?.length || 0;
      }
    });

    focus = newFocus;
    focusOffset = newOffset;
  }

  let [start, end] = [
    { lineId: null, blockId: null, node: focus, index: focusOffset },
    { lineId: null, blockId: null, node: anchor, index: anchorOffset },
  ];

  const anchorComesFirst = !!(
    anchor?.compareDocumentPosition(focus) & Node.DOCUMENT_POSITION_FOLLOWING
  );

  if (anchorComesFirst) {
    [start, end] = [end, start];
  }

  start.blockId = (start.node as HTMLElement)?.dataset?.blockId;
  end.blockId = (end.node as HTMLElement)?.dataset?.blockId;

  start.lineId = (start.node as HTMLElement)
    ?.closest("[data-line-id]")
    ?.getAttribute("data-line-id");
  end.lineId = (end.node as HTMLElement)
    ?.closest("[data-line-id]")
    ?.getAttribute("data-line-id");

  return [start, end];
};

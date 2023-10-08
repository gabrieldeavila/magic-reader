// dissolutus get block

/**
 * Returns the first or last child node of a block element with the specified ID.
 * If the block element contains a <code> element, returns the first or last child of that element.
 * @param id - The ID of the block element to search for.
 * @param first - If true, returns the first child node. If false, returns the last child node. Defaults to true.
 * @returns The first or last child node of the block element, or null if the element is not found.
 */

export const dgb = (id: string, first?: boolean) => {
  let block = document.querySelector(`[data-block-id="${id}"]`)?.firstChild;

  if (block?.nodeName !== "#text") {
    // gets the querySelector
    // @ts-expect-error - it's a node
    const isCode = block?.querySelector("code");

    if (first ?? true) {
      // gets the first child
      block = isCode?.firstChild?.firstChild;
    } else {
      block = isCode?.lastChild?.firstChild;
    }
  }

  return block;
};

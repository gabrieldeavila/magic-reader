// dissolutus get block

/**
 * Returns the first or last child node of a block element with the specified ID.
 * If the block element contains a <code> element, returns the first or last child of that element.
 * @param id - The ID of the block element to search for.
 * @param first - If true, returns the first child node. If false, returns the last child node. Defaults to true.
 * @param exactly - Optional. If specified, returns the child node at the specified index. If the index is out of range, returns null.
 * @returns The first or last child node of the block element, or null if the element is not found.
 */

export const dgb = (id: string, first?: boolean, exactly?: number) => {
  let block = document.querySelector(`[data-block-id="${id}"]`)?.firstChild;

  if (block?.nodeName !== "#text") {
    // gets the querySelector
    // @ts-expect-error - it's a node
    const isCode = block?.querySelector("code");

    if (exactly != null) {
      let found = false;
      let index = 0;
      let number = 0;

      const children = isCode?.childNodes;
      if (!children) return null;

      while (!found) {
        block = children[index];
        if (!block) {
          block = isCode?.lastChild;
          found = true;
        } else {
          number += block.textContent?.length ?? 0;
          if (number >= exactly || exactly === 0) {
            block = block?.firstChild;
            found = true;
          } else {
            index++;
          }
        }
      }
    } else if (first ?? true) {
      // gets the first child
      block = isCode?.firstChild?.firstChild;
    } else {
      block = isCode?.lastChild?.firstChild;
    }
  }

  return block;
};

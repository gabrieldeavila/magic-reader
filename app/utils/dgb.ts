// dissolutus get block

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

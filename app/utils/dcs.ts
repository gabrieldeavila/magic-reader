// dissolutus change selection
import { dgb } from "./dgb";

/**
 * Changes the current selection to a new range between two elements.
 * @param firstId - The ID of the first element in the range.
 * @param lastId - The ID of the last element in the range.
 * @param firstFromLast - Optional. If true, the last element will be selected from the end. Default is false.
 */

export const dcs = (firstId: string, lastId: string, firstFromLast?: boolean) => {
  const selection = window.getSelection();

  const range = document.createRange();

  const first = dgb(firstId);

  const last = dgb(lastId, firstFromLast);

  if (!first || !last) return;

  range.setStart(first, 0);

  range.setEnd(last, last.textContent?.length ?? 0);

  selection.removeAllRanges();
  selection.addRange(range);
};

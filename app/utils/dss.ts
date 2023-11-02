/**
 * Sets the selection range of two elements.
 * @param firstId - The ID of the first element in the range.
 * @param firstIndex - The index of the first element in the range.
 * @param lastId - The ID of the last element in the range.
 * @param lastIndex - The index of the last element in the range.
 * @returns void
 */

import { dgb } from "./dgb";

export const dss = (
  firstId: string,
  firstIndex: number,
  lastId: string,
  lastIndex: number
) => {
  const range = document.createRange();

  const first = dgb(firstId, false, firstIndex);
  console.log(lastIndex);

  const last = dgb(lastId, false, lastIndex);
  console.log(first, last, firstId, firstIndex);

  if (!first || !last) return;

  if (firstIndex > first.textContent?.length ?? 0) {
    firstIndex = first.textContent?.length ?? 0;
  }

  range.setStart(first, firstIndex);

  lastIndex++;

  if (lastIndex > last.textContent?.length ?? 0) {
    lastIndex = last.textContent?.length ?? 0;
  }

  range.setEnd(last, lastIndex);

  // selection.removeAllRanges();
  // selection.addRange(range);

  return range;
};

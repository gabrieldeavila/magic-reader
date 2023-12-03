import { useCallback } from "react";
import { globalState } from "react-trigger-state";
import { IWritterContent } from "../../interface";

function useFocusOnStart() {
  const addFocus = useCallback(
    ({ content }: { content: IWritterContent[] }) => {
      if (
        content.length === 1 &&
        content[0].text.length === 1 &&
        content[0].text[0].value === ""
      ) {
        const titleRef = globalState.get("title_ref");
        titleRef?.focus();

        // add the selection to the title
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(titleRef);
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
    },
    []
  );

  return { addFocus };
}

export default useFocusOnStart;

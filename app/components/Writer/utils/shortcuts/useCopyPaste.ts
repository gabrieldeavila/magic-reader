import { useEffect } from "react";
import { useWriterContext } from "../../context/WriterContext";
import { IShortcuts } from "../../interface";

function useCopyPaste({ ref, editableInfo, position, text }: IShortcuts) {
  const { setContent } = useWriterContext();

  // gets when ctrl + c is pressed
  useEffect(() => {
    const refInstance = ref.current;

    const handleCopy = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "c" && editableInfo.current.hasFocus) {
        // prevents the default copy event
        // e.preventDefault();

        // if the user has selected text, it copies it, otherwise it copies the whole editable
        // but becareful, because what is selected is not the same as what is copied!
        // ex-> "Hello" can be "**Hello**" but the selected text is "Hello", so it has to copy "**Hello**"
        const hasSelection = window.getSelection()?.toString();
        let textToCopy = `${refInstance.innerHTML}\n`;

        if (hasSelection) {
          // selects only the text that is selected
          textToCopy = refInstance.innerHTML.substring(
            window.getSelection()?.anchorOffset,
            window.getSelection()?.focusOffset
          );
        }

        setTimeout(() => {
          // copies
          navigator.clipboard.writeText(textToCopy);
        });
      }
    };

    refInstance?.addEventListener("keydown", handleCopy);
    return () => {
      refInstance?.removeEventListener("keydown", handleCopy);
    };
  }, [editableInfo, ref, text]);

  // gets when ctrl + v is pressed
  useEffect(() => {
    const refInstance = ref.current;
    
    const handlePaste = async (e: ClipboardEvent) => {
      console.log(e);

      if (!editableInfo.current.hasFocus) return;

      // prevents the default paste event
      // e.preventDefault();

      const copiedValue = e.clipboardData.getData("text/plain");
      console.log(copiedValue);
      // if has \n in the end, adds a new paragraph
      if (copiedValue.endsWith("\n")) {
        setContent((prev) => {
          const newContent = [...prev];
          newContent.splice(position + 1, 0, {
            text: copiedValue.replace("\n", ""),
          });

          return newContent;
        });

        return;
      }

      const currSelection = window.getSelection()?.anchorOffset;

      // if not, adds in the same paragraph, but where the cursor is
      setContent((prev) => {
        const newContent = [...prev];
        newContent[position].text =
          newContent[position].text.substring(0, currSelection) +
          copiedValue +
          newContent[position].text.substring(currSelection);

        return newContent;
      });

      setTimeout(() => {
        const newSelection = currSelection + copiedValue.length;

        editableInfo.current.selection = newSelection;
      });
    };

    refInstance?.addEventListener("paste", handlePaste);

    return () => {
      refInstance?.removeEventListener("paste", handlePaste);
    };
  }, [editableInfo, position, ref, setContent]);

  return null;
}

export default useCopyPaste;

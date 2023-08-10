import { useEffect, useState } from "react";
import { IShortcuts } from "../../interface";
import { useWriterContext } from "../../context/WriterContext";

function useCopyPaste({ ref, editableInfo, position, text }: IShortcuts) {
  const { setContent } = useWriterContext();

  // gets when ctrl + c is pressed
  useEffect(() => {
    const refInstance = ref.current;

    const handleCopy = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "c" && editableInfo.current.hasFocus) {
        // prevents the default copy event
        e.preventDefault();

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

        // copies
        navigator.clipboard.writeText(textToCopy);
      }
    };

    refInstance?.addEventListener("keydown", handleCopy);
    return () => {
      refInstance?.removeEventListener("keydown", handleCopy);
    };
  }, [text]);

  // gets when ctrl + v is pressed
  useEffect(() => {
    const handlePaste = async (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "v") {
        // prevents the default paste event
        e.preventDefault();

        const copiedValue = await navigator.clipboard.readText();

        // if has \n in the end, adds a new paragraph
        if (copiedValue.endsWith("\n")) {
          setContent((prev) => {
            const newContent = [...prev];
            newContent.splice(position + 1, 0, {
              text: copiedValue.replace("\n", ""),
            });
            console.log(copiedValue);
            return newContent;
          });
          return;
        }
      }
    };

    ref.current?.addEventListener("keydown", handlePaste);

    return () => {
      ref.current?.removeEventListener("keydown", handlePaste);
    };
  }, []);

  return null;
}

export default useCopyPaste;

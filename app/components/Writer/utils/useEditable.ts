import { useEffect, useRef } from "react";
import { IEditableProps } from "../interface";
import useShortcuts from "./shortcuts/useShortcuts";

function useEditable({ ref, ...props }: IEditableProps) {
  const editableInfo = useRef({
    hasFocus: false,
  });

  useShortcuts({ ref, editableInfo, ...props });

  useEffect(() => {
    // gets when the user is on the editable
    const handleFocus = (e: FocusEvent) => {
      editableInfo.current.hasFocus = true;
    };

    // add event listener to the editable
    ref.current?.addEventListener("focus", handleFocus);

    // remove event listener when the component unmounts
    return () => {
      ref.current?.removeEventListener("focus", handleFocus);
    };
  }, []);

  // when loses focus, it returns the editable info
  useEffect(() => {
    const handleBlur = (e: FocusEvent) => {
      editableInfo.current.hasFocus = false;
    };

    ref.current?.addEventListener("blur", handleBlur);

    return () => {
      ref.current?.removeEventListener("blur", handleBlur);
    };
  }, []);

  // gets when the user reaches the end of the editable
  useEffect(() => {
    const handleEnd = (e: KeyboardEvent) => {
      const value = ref.current?.innerText;
      if (value.length === 0) {
        console.log("zerooo");
      }
    };

    ref.current?.addEventListener("keyup", handleEnd);

    return () => {
      ref.current?.removeEventListener("keyup", handleEnd);
    };
  }, []);
}

export default useEditable;

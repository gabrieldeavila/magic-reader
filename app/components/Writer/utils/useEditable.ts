import { useEffect, useRef } from "react";
import { IEditable, IEditableProps } from "../interface";

function useEditable({ ref }: IEditableProps) {
  const editableInfo = useRef({
    hasFocus: false,
  });

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
}

export default useEditable;

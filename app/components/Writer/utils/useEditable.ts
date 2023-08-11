import { useEffect, useLayoutEffect, useRef } from "react";
import { IEditableProps, TEditable } from "../interface";
import useShortcuts from "./shortcuts/useShortcuts";
import useSetRange from "./useSetRange";

function useEditable({ ref, ...props }: IEditableProps) {
  const editableInfo = useRef<TEditable>({
    hasFocus: false,
    selection: null,
  });

  useShortcuts({ ref, editableInfo, ...props });
  const { setRange } = useSetRange({ ref, editableInfo, ...props });

  useLayoutEffect(() => {
    setRange();
  }, [props.text, ref, setRange]);

  useEffect(() => {
    setTimeout(() => {
      setRange();
    }, 200);
  }, [props.text, setRange]);

  useEffect(() => {
    const refInstance = ref.current;

    // gets when the user is on the editable
    const handleFocus = () => {
      editableInfo.current.hasFocus = true;
    };

    // add event listener to the editable
    refInstance?.addEventListener("focus", handleFocus);

    // remove event listener when the component unmounts
    return () => {
      refInstance?.removeEventListener("focus", handleFocus);
    };
  }, [ref]);

  // when loses focus, it returns the editable info
  useEffect(() => {
    const refInstance = ref.current;

    const handleBlur = () => {
      editableInfo.current.hasFocus = false;
    };

    refInstance?.addEventListener("blur", handleBlur);

    return () => {
      refInstance?.removeEventListener("blur", handleBlur);
    };
  }, [ref]);

  // gets when the user reaches the end of the editable
  useEffect(() => {
    const refInstance = ref.current;

    const handleEnd = () => {
      const value = ref.current?.innerText;
      if (value.length === 0) {
        console.log("zerooo");
      }
    };

    refInstance?.addEventListener("keyup", handleEnd);

    return () => {
      refInstance?.removeEventListener("keyup", handleEnd);
    };
  }, [ref]);
}

export default useEditable;

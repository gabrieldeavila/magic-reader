import React, { useCallback, useEffect, useRef, useState } from "react";
import { ExternalLink } from "react-feather";
import { globalState } from "react-trigger-state";
import { useContextName } from "../../context/WriterContext";
import useRange from "../../hooks/useRange";
import { IText } from "../../interface";
import { PopupFunctions } from "../interface";
import WPopup from "../style";
import LinkStyle from "./style";

function Link({
  popupRef,
  selectedOptions,
  addDecoration,
  text,
  id,
}: {
  id: string;
  text: IText[];
  popupRef: React.MutableRefObject<PopupFunctions>;
  selectedOptions: string[];
  addDecoration: (type: string) => void;
}) {
  const [show, setShow] = useState(false);
  const ref = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [input, setInput] = useState("");
  const optionsRef = useRef<HTMLDivElement>(null);
  const contextName = useContextName();

  const { getSelectedRange } = useRange();

  const externalLink = useCallback(() => {
    const includes = selectedOptions.includes("external_link");
    getSelectedRange();
    setShow((prev) => !prev);

    // add focus to input
    setTimeout(() => {
      inputRef.current?.focus?.();
    });

    if (!includes) {
      // addDecoration("external_link");
    }
  }, [getSelectedRange, selectedOptions]);

  const handleKeyDown = useCallback((e) => {
    e.stopPropagation();
  }, []);

  useEffect(() => {
    // sets show to false when clicked outside
    function handleClickOutside(event: MouseEvent) {
      if (
        ref.current &&
        !ref.current.contains(event.target as Node) &&
        optionsRef.current &&
        !optionsRef.current.contains(event.target as Node)
      ) {
        setShow(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleApply = useCallback(() => {
    const content = globalState.get(contextName);

    console.log(text, input);
  }, [contextName, id, input, text]);

  return (
    <>
      <WPopup.Item data-link>
        <WPopup.Code
          ref={(el) => (
            (popupRef.current.external_link = el), (ref.current = el)
          )}
          data-code
          isSelected={selectedOptions.includes("external_link")}
          onClick={externalLink}
        >
          Link <ExternalLink size={14} />
        </WPopup.Code>

        <LinkStyle.Wrapper show={show} ref={optionsRef}>
          <LinkStyle.Container>
            <LinkStyle.Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="https://example.com"
            />
            <LinkStyle.Apply onClick={handleApply}>Apply</LinkStyle.Apply>
            <LinkStyle.Remove>Remove</LinkStyle.Remove>
          </LinkStyle.Container>
        </LinkStyle.Wrapper>
      </WPopup.Item>
    </>
  );
}

export default Link;

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ExternalLink } from "react-feather";
import useRange from "../../hooks/useRange";
import { IText } from "../../interface";
import { PopupFunctions } from "../interface";
import WPopup from "../style";
import LinkStyle from "./style";

function Link({
  popupRef,
  selectedOptions,
  addDecoration,
}: {
  id: string;
  text: IText[];
  popupRef: React.MutableRefObject<PopupFunctions>;
  selectedOptions: string[];
  addDecoration: (type: string, customStyle?: Record<string, any>) => void;
}) {
  const [show, setShow] = useState(false);
  const ref = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [input, setInput] = useState("");
  const optionsRef = useRef<HTMLDivElement>(null);

  const { getSelectedRange, hideSelector, setPrevRange } = useRange();

  const includes = useMemo(
    () => selectedOptions.includes("external_link"),
    [selectedOptions]
  );

  const externalLink = useCallback(() => {
    if (show) {
      inputRef.current?.focus?.();
      return;
    }

    getSelectedRange();

    setShow((prev) => !prev);

    // add focus to input
    setTimeout(() => {
      inputRef.current?.focus?.();
    });
  }, [getSelectedRange, show]);

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
    hideSelector();
    setPrevRange();

    setTimeout(() => {
      addDecoration("external_link", {
        link: input,
      });
    });
  }, [addDecoration, hideSelector, input, setPrevRange]);

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
            {includes && <LinkStyle.Remove>Remove</LinkStyle.Remove>}
          </LinkStyle.Container>
        </LinkStyle.Wrapper>
      </WPopup.Item>
    </>
  );
}

export default Link;

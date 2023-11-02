import React, { useCallback, useEffect, useRef, useState } from "react";
import WPopup from "../style";
import { ExternalLink } from "react-feather";
import { IText } from "../../interface";
import { PopupFunctions } from "../interface";
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
  addDecoration: (type: string) => void;
}) {
  const [show, setShow] = useState(false);
  const ref = useRef<HTMLButtonElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);

  const externalLink = useCallback(() => {
    const includes = selectedOptions.includes("external_link");
    setShow(!includes);
    addDecoration("external_link");
  }, [addDecoration, selectedOptions]);

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
        console.log("Nao, bocó");
        setShow(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
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
            onKeyDown={handleKeyDown}
            placeholder="https://example.com"
          />
          <LinkStyle.Apply>Apply</LinkStyle.Apply>
          <LinkStyle.Remove>Remove</LinkStyle.Remove>
        </LinkStyle.Container>
      </LinkStyle.Wrapper>
    </WPopup.Item>
  );
}

export default Link;

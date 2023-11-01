import React, { useCallback } from "react";
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
  const externalLink = useCallback(() => {
    addDecoration("external_link");
  }, [addDecoration]);

  return (
    <WPopup.Item>
      <WPopup.Code
        ref={(el) => (popupRef.current.external_link = el)}
        data-code
        isSelected={selectedOptions.includes("external_link")}
        onClick={externalLink}
      >
        Link <ExternalLink size={14} />
      </WPopup.Code>

      <LinkStyle.Wrapper>
        <LinkStyle.Container>
          <LinkStyle.Input placeholder="https://example.com" />
          <LinkStyle.Apply>Apply</LinkStyle.Apply>
          <LinkStyle.Remove>Remove</LinkStyle.Remove>
        </LinkStyle.Container>
      </LinkStyle.Wrapper>
    </WPopup.Item>
  );
}

export default Link;

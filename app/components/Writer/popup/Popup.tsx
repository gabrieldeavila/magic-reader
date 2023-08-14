import { memo, useCallback, useMemo } from "react";
import { IPopup } from "../interface";
import WPopup from "./style";

const Popup = memo(({ text, parentRef }: IPopup) => {
  const mimic = useMemo(
    () =>
      text.reduce((acc, item) => {
        const words = item.value.split("");

        words.forEach((word) => {
          acc.push({
            letter: word,
            id: item.id,
          });
        });

        return acc;
      }, []),
    [text]
  );

  const isUp = useMemo(() => {
    if (!parentRef.current) return false;

    const bounding = parentRef.current.getBoundingClientRect();

    // if the top is less than 100, then the popup should be below the text
    return bounding.top < 100;
  }, [parentRef]);

  const bold = useCallback(() => {
    const selection = window.getSelection();

    const anchor = selection.anchorNode.parentElement;
    const anchorOffset = selection.anchorOffset;

    // @ts-expect-error - it is a valid attribute
    const extent = selection.extentNode.parentElement;
    // @ts-expect-error - it is a valid attribute
    const extentOffset = selection.extentOffset;

    // see which node is the first
    // if the anchor is the first, then the extent is the last
    const anchorComesFirst =
      anchor.compareDocumentPosition(extent) & Node.DOCUMENT_POSITION_FOLLOWING;

    const firstNode = anchorComesFirst ? anchor : extent;
    const lastNode = anchorComesFirst ? extent : anchor;

    const firstNodeOffset = anchorComesFirst ? anchorOffset : extentOffset;
    const lastNodeOffset = (anchorComesFirst ? extentOffset : anchorOffset) - 1;

    const firstNodeId = parseInt(firstNode.getAttribute("data-block-id"));

    const lastNodeId = parseInt(lastNode.getAttribute("data-block-id"));

    let firstIdIndex = 0;

    const firstNodeIndex = mimic.findIndex(({ id }) => {
      if (id === firstNodeId) {
        return firstIdIndex++ === firstNodeOffset;
      }

      return false;
    });

    let lastIdIndex = 0;

    const lastNodeIndex = mimic.findIndex(({ id }) => {
      if (id === lastNodeId) {
        return lastIdIndex++ === lastNodeOffset;
      }

      return false;
    });

    console.log(firstNodeIndex, lastNodeIndex, mimic);
  }, [mimic]);

  return (
    <WPopup.Wrapper isUp={false} contentEditable={false}>
      <WPopup.Content>
        <WPopup.Item>
          <WPopup.B onClick={bold}>B</WPopup.B>
        </WPopup.Item>

        <WPopup.Item>
          <WPopup.I>i</WPopup.I>
        </WPopup.Item>

        <WPopup.Item>
          <WPopup.U>U</WPopup.U>
        </WPopup.Item>
      </WPopup.Content>
    </WPopup.Wrapper>
  );
});

Popup.displayName = "Popup";

export default Popup;

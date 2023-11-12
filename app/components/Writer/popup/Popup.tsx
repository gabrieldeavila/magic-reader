import {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Code, PenTool } from "react-feather";
import { globalState, useTriggerState } from "react-trigger-state";
import useDecoration from "../hooks/useDecoration";
import usePositions from "../hooks/usePositions";
import { IPopup } from "../interface";
import Align from "./align/Align";
import { PopupFunctions } from "./interface";
import Link from "./link/Link";
import PopupSelect from "./select/select";
import WPopup from "./style";

const PopupComp = (
  { id, text, parentRef, type, align }: IPopup,
  popupRef: React.MutableRefObject<PopupFunctions>
) => {
  const ref = useRef<HTMLDivElement>(null);

  const mimic = useMemo(
    () =>
      text.reduce((acc, item) => {
        const words = item.value.split("");

        words.forEach((letter, index) => {
          acc.push({
            letter: letter,
            id: item.id,
            index,
          });
        });

        return acc;
      }, []),
    [text]
  );

  const isUp = useMemo(() => {
    if (!parentRef.current) return false;

    // if the top is less than 100, then the popup should be below the text
    return false;
  }, [parentRef]);

  const [updatePositions] = useTriggerState({
    name: "force_popup_positions_update",
  });

  const [positions, setPositions] = useState({});

  const { getFirstAndLastNode } = usePositions({ text });

  const { selectedOptions, setSelectedOptions, addDecoration } = useDecoration({
    id,
    text,
  });

  const [isMultiLine, setIsMultiLine] = useState(false);
  const [custom, setCustom] = useState({});

  const handleColors = useCallback(() => {
    const {
      firstNodeIndex,
      lastNodeIndex,
      selectedLetters,
      areFromDiffLines,
      multiLineInfo,
    } = getFirstAndLastNode();

    setIsMultiLine(areFromDiffLines);

    const selected = (selectedLetters ?? mimic).slice(
      firstNodeIndex,
      lastNodeIndex + 1
    );

    // gets the ids of the selected (unique)
    const selectedIds = selected.reduce((acc, item) => {
      if (!acc.includes(item.id)) acc.push(item.id);

      return acc;
    }, []);

    const selectedBlocks = (
      areFromDiffLines ? multiLineInfo.selectedBlocks : text
    ).filter(({ id }) => selectedIds.includes(id));
    // gets the options that are in all the selected
    const { options, custom } = selectedBlocks.reduce(
      (acc, item, index) => {
        if (item.custom) {
          acc.custom = { ...acc.custom, ...item.custom };
        }

        if (index === 0) {
          acc.options.push(...item.options);
          return acc;
        }

        const newOptions = [];

        acc.options.forEach((option) => {
          if (item.options.includes(option)) {
            newOptions.push(option);
          }
        });

        acc.options = newOptions;

        return acc;
      },
      { options: [], custom: {} }
    );

    setCustom(custom);
    setSelectedOptions(options);
  }, [getFirstAndLastNode, mimic, setSelectedOptions, text]);

  useLayoutEffect(() => {
    // gets the position of the selected text
    const selection = window.getSelection();

    const anchor = selection.anchorNode?.parentElement;
    const focus = selection.focusNode?.parentElement;

    let position = focus?.getBoundingClientRect?.();
    let blockInfo = { block: focus, offset: selection.focusOffset };

    if (!anchor || !focus || !position) return;

    const anchorComesFirst = !!(
      anchor?.compareDocumentPosition(focus) & Node.DOCUMENT_POSITION_FOLLOWING
    );

    const isTopOutOfScreen = position.top + window.scrollY - 40 < 0;
    let isPrevAnchor =
      !globalState.get("selection_range").anchorComesFirst &&
      globalState.get("selection_range").anchorComesFirst != null;

    if ((!anchorComesFirst && isTopOutOfScreen) || isPrevAnchor) {
      const isPrevAnchorOutOfScreen =
        isPrevAnchor &&
        anchor?.getBoundingClientRect?.().top + window.scrollY - 40 < 0;

      if (!isPrevAnchorOutOfScreen) {
        position = anchor?.getBoundingClientRect?.();
        blockInfo = { block: anchor, offset: selection.anchorOffset };
      } else {
        isPrevAnchor = false;
      }
    }

    if (!position) return;

    handleColors();

    const width = ref.current?.getBoundingClientRect()?.width;
    try {
      // create a new range
      const rangeOffset = document.createRange();

      // if tries to select an empty block, select the previous block
      if (blockInfo.block.firstChild.textContent === "") {
        const prevSibling = blockInfo.block.previousSibling;
        rangeOffset.selectNode(prevSibling.lastChild);
        rangeOffset.setStart(
          prevSibling.lastChild.firstChild,
          prevSibling.lastChild.textContent.length - 1
        );
        rangeOffset.setEnd(
          prevSibling.lastChild.firstChild,
          prevSibling.lastChild.textContent.length - 1
        );
      } else {
        // select the block
        rangeOffset.selectNode(blockInfo.block.firstChild);
        // set the start offset
        rangeOffset.setStart(blockInfo.block.firstChild, blockInfo.offset);
        rangeOffset.setEnd(blockInfo.block.firstChild, blockInfo.offset);
      }

      // get the position of the start offset
      const infoRange = rangeOffset.getBoundingClientRect();

      const left = infoRange.right + width;
      // sees if the popup is out of the screen
      const isOutOfScreen = window.innerWidth < left;

      let newPositions = {};

      let newLeft;
      const newTop =
        infoRange.top +
        ((anchorComesFirst || isTopOutOfScreen) && !isPrevAnchor
          ? infoRange.height + 5
          : -40);

      if (isOutOfScreen) {
        newLeft = infoRange.left - width;
      } else {
        newLeft = infoRange.right - infoRange.width;
      }

      if (newLeft < 0) newLeft = infoRange.x;

      console.log(newTop, newLeft, rangeOffset);

      newPositions = {
        left: `${newLeft}px`,
        top: `${newTop}px`,
      };

      setPositions(newPositions);
    } catch (e) {
      console.log("remember to fix this error");
    }
  }, [handleColors, updatePositions]);

  const bold = useCallback(() => {
    addDecoration("bold");
  }, [addDecoration]);

  const italic = useCallback(() => {
    addDecoration("italic");
  }, [addDecoration]);

  const underline = useCallback(() => {
    addDecoration("underline");
  }, [addDecoration]);

  const strikethrough = useCallback(() => {
    addDecoration("strikethrough");
  }, [addDecoration]);

  const code = useCallback(() => {
    addDecoration("code");
  }, [addDecoration]);

  const highlight = useCallback(() => {
    addDecoration("highlight");
  }, [addDecoration]);

  useEffect(() => {
    setTimeout(() => {
      globalState.set("popup_field", popupRef.current);
    });

    return () => {
      globalState.set("popup_field", null);
    };
  }, [popupRef]);

  return (
    <WPopup.Wrapper
      style={positions}
      isUp={isUp}
      contentEditable={false}
      ref={ref}
      data-popup={id}
    >
      <WPopup.Content>
        {!isMultiLine && (
          <>
            <WPopup.Item>
              <PopupSelect type={type} />
            </WPopup.Item>
            <WPopup.Divider />
          </>
        )}

        <WPopup.Item>
          <WPopup.B
            ref={(el) => (popupRef.current.bold = el)}
            isSelected={selectedOptions.includes("bold")}
            data-bold
            onClick={bold}
          >
            B
          </WPopup.B>
        </WPopup.Item>

        <WPopup.Item>
          <WPopup.I
            ref={(el) => (popupRef.current.italic = el)}
            isSelected={selectedOptions.includes("italic")}
            data-italic
            onClick={italic}
          >
            i
          </WPopup.I>
        </WPopup.Item>

        <WPopup.Item>
          <WPopup.U
            ref={(el) => (popupRef.current.underline = el)}
            isSelected={selectedOptions.includes("underline")}
            data-underline
            onClick={underline}
          >
            U
          </WPopup.U>
        </WPopup.Item>

        <WPopup.Item>
          <WPopup.S
            ref={(el) => (popupRef.current.strikethrough = el)}
            data-strikethrough
            isSelected={selectedOptions.includes("strikethrough")}
            onClick={strikethrough}
          >
            S
          </WPopup.S>
        </WPopup.Item>

        <WPopup.Item>
          <WPopup.Code
            ref={(el) => (popupRef.current.highlight = el)}
            data-highlight
            isSelected={selectedOptions.includes("highlight")}
            onClick={highlight}
          >
            <PenTool size={14} />
          </WPopup.Code>
        </WPopup.Item>

        <WPopup.Item>
          <WPopup.Code
            ref={(el) => (popupRef.current.code = el)}
            data-code
            isSelected={selectedOptions.includes("code")}
            onClick={code}
          >
            <Code size={14} />
          </WPopup.Code>
        </WPopup.Item>

        {!isMultiLine && (
          <>
            <WPopup.Divider />
            <WPopup.Item>
              <Link
                addDecoration={addDecoration}
                text={text}
                id={id}
                custom={custom}
                popupRef={popupRef}
                selectedOptions={selectedOptions}
              />
            </WPopup.Item>

            <WPopup.Divider />
            <WPopup.Item>
              <Align id={id} align={align} />
            </WPopup.Item>
          </>
        )}
      </WPopup.Content>
    </WPopup.Wrapper>
  );
};

const Popup = memo(forwardRef<PopupFunctions, IPopup>(PopupComp));

Popup.displayName = "Popup";

export default Popup;

import { GTTooltip } from "@geavila/gt-design";
import React, { useCallback } from "react";
import { Feather } from "react-feather";
import { IImage } from "../../interface";
import ImageComp from "./style";
import { useContextName } from "../../context/WriterContext";
import { globalState } from "react-trigger-state";

function Image({ customStyle, id }: IImage) {
  const imgRef = React.useRef<HTMLImageElement>(null);
  const iconsRef = React.useRef<HTMLDivElement>(null);
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const featherRef = React.useRef<HTMLDivElement>(null);
  const captionRef = React.useRef<HTMLDivElement>(null);

  const contextName = useContextName();

  const addCaption = useCallback(() => {
    captionRef.current?.focus();

    // scrolls to the captionRef
    wrapperRef.current?.scrollTo({
      top: captionRef.current?.offsetTop,
      behavior: "smooth",
    });
  }, []);

  const handleAddCaption = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      // gets the value
      const content = globalState.get(contextName);

      // gets the current index
      const currentIndex = content.findIndex((item) => item.id === id);

      // updates the value
      content[currentIndex].customStyle.caption = e.currentTarget.innerText;

      // sets the value
      globalState.set(contextName, content);
    },
    [contextName, id]
  );

  return (
    <ImageComp.Wrapper
      ref={wrapperRef}
      draggable={false}
      contentEditable={false}
      onDragStart={(e) => e.preventDefault()}
      onDrag={(e) => e.preventDefault()}
    >
      <ImageComp.Svg ref={iconsRef}>
        <ImageComp.IconBtn onClick={addCaption} role="button" ref={featherRef}>
          <Feather size={15} />
          <GTTooltip parentRef={featherRef} text="ADD_CAPTION" />
        </ImageComp.IconBtn>
      </ImageComp.Svg>

      <ImageComp.Img ref={imgRef} src={customStyle.src} />
      <ImageComp.Caption
        ref={captionRef}
        onKeyUp={handleAddCaption}
        contentEditable={true}
        suppressContentEditableWarning={true}
        placeholder="Add caption"
      >
        {customStyle.caption}
      </ImageComp.Caption>
    </ImageComp.Wrapper>
  );
}

export default Image;

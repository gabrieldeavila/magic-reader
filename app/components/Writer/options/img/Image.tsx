import React, { useEffect } from "react";
import { IImage } from "../../interface";
import ImageComp from "./style";
import { Feather } from "react-feather";

function Image({ customStyle }: IImage) {
  const imgRef = React.useRef<HTMLImageElement>(null);
  const iconsRef = React.useRef<HTMLDivElement>(null);
  const wrapperRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = () => {
      if (wrapperRef.current == null || imgRef.current == null) return;

      const bounds = imgRef.current.getBoundingClientRect();
      const wrapperBounds = wrapperRef.current.getBoundingClientRect();

      const diff = bounds.left - wrapperBounds.left;

      iconsRef.current.style.right = `${diff}px`;
    };

    handler();

    document.addEventListener("resize", handler);

    return () => document.removeEventListener("resize", handler);
  }, []);

  return (
    <ImageComp.Wrapper
      ref={wrapperRef}
      draggable={false}
      contentEditable={false}
      onDragStart={(e) => e.preventDefault()}
      onDrag={(e) => e.preventDefault()}
    >
      <ImageComp.Svg ref={iconsRef}>
        <Feather size={15} />
      </ImageComp.Svg>

      <ImageComp.Img ref={imgRef} src={customStyle.src} />
    </ImageComp.Wrapper>
  );
}

export default Image;

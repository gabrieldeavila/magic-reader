import React, { useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { ViewerComp } from "./style";

function Viewer({ img, onClose }: { img: string; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const isMouseDown = useRef(false);
  const lastCoords = useRef({
    x: 0,
    y: 0,
  });

  const currStyle = useRef({
    scale: 1,
    translate: {
      x: 0,
      y: 0,
    },
  });

  // adds zoom in and zoom out functionality
  const handleWheel = useCallback(
    (e: React.WheelEvent<HTMLDivElement>) => {
      // gets the current scale
      const currentScale = ref.current?.style.transform
        ? Number(ref.current?.style.transform.split("scale(")[1].split(")")[0])
        : 1;

      const scale = e.deltaY < 0 ? currentScale + 0.1 : currentScale - 0.1;

      if (scale < 0.1) return;

      // sets the scale and translate
      ref.current!.style.transform = `translate(${currStyle.current.translate.x}px, ${currStyle.current.translate.y}px) scale(${scale})`;

      // sets the current scale
      currStyle.current.scale = scale;
    },
    [ref]
  );

  // moves to the right or left, up or down
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isMouseDown.current) return;
    imgRef.current.style.setProperty("cursor", "grabbing", "important");

    // gets the current x position
    const currentX = e.clientX;
    const currentY = e.clientY;

    // gets the difference
    const isRight = lastCoords.current.x < currentX;
    const isDown = lastCoords.current.y < currentY;

    const diffX = Math.abs(lastCoords.current.x - currentX);
    const diffY = Math.abs(lastCoords.current.y - currentY);

    // sets the new translate
    const translateX = isRight ? diffX : -diffX;
    const translateY = isDown ? diffY : -diffY;

    // changes the img position
    ref.current!.style.transform = `translate(${translateX}px, ${translateY}px) scale(${currStyle.current.scale})`;

    // sets the current translate
    currStyle.current.translate = {
      x: translateX,
      y: translateY,
    };
  }, []);

  const handleMouseUp = useCallback(() => {
    isMouseDown.current = false;

    imgRef.current.style.cursor = "grab";

    lastCoords.current = {
      x: 0,
      y: 0,
    };
  }, []);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      isMouseDown.current = true;

      lastCoords.current = {
        x: e.clientX,
        y: e.clientY,
      };
    },
    []
  );

  // ads the escape key functionality
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();

        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  return createPortal(
    <ViewerComp.Wrapper onDoubleClick={onClose}>
      <ViewerComp.Container
        ref={ref}
        // when the middle mouse button is scrolled
        onWheel={handleWheel}
        // when mouse is moved
        onMouseMove={handleMouseMove}
        // when mouse is pressed
        onMouseDown={handleMouseDown}
        // when mouse is released
        onMouseUp={handleMouseUp}
      >
        <img ref={imgRef} src={img} />
      </ViewerComp.Container>
    </ViewerComp.Wrapper>,
    document.body
  );
}

export default Viewer;

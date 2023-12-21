import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut } from "react-feather";
import { ViewerComp } from "./style";

function Viewer({ img, onClose }: { img: string; onClose: () => void }) {
  const [allImages, setAllImages] = useState<string[]>([]);
  const [currImageIndex, setCurrImageIndex] = useState(0);
  const currentImg = useMemo(
    () => allImages[currImageIndex],
    [allImages, currImageIndex]
  );

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

  useEffect(() => {
    const imgs = Array.from(document.querySelectorAll("[data-img]"));
    const currImg = imgs.findIndex((item) => item.getAttribute("src") === img);

    setAllImages(imgs.map((item) => item.getAttribute("src")!));
    setCurrImageIndex(currImg);
  }, [img]);

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

  const handleNextImg = useCallback(
    (e) => {
      e.stopPropagation();

      // remove the zoom and translate
      ref.current!.style.transform = "scale(1)";

      setCurrImageIndex((prev) => {
        if (currImageIndex === allImages.length - 1) return 0;

        return prev + 1;
      });
    },
    [currImageIndex, allImages]
  );

  const handlePrevImg = useCallback(
    (e) => {
      e.stopPropagation();

      // remove the zoom and translate
      ref.current!.style.transform = "scale(1)";

      setCurrImageIndex((prev) => {
        if (currImageIndex === 0) return allImages.length - 1;

        return prev - 1;
      });
    },
    [allImages.length, currImageIndex]
  );

  const handleClose = useCallback(
    (e: KeyboardEvent | React.MouseEvent) => {
      e.stopPropagation();

      // prevents the closing of the modal when clicking on the buttons
      if ((e.target as Element).closest("button")) return;

      onClose();
    },
    [onClose]
  );

  const handleZoomOut = useCallback((e) => {
    e.stopPropagation();

    // gets the current scale
    const currentScale = ref.current?.style.transform
      ? Number(ref.current?.style.transform.split("scale(")[1].split(")")[0])
      : 1;

    const scale = currentScale - 0.5;

    if (scale < 0.1) return;

    // sets the scale and translate
    ref.current!.style.transform = `translate(${currStyle.current.translate.x}px, ${currStyle.current.translate.y}px) scale(${scale})`;

    // sets the current scale
    currStyle.current.scale = scale;
  }, []);

  const handleZoomIn = useCallback((e) => {
    e.stopPropagation();

    // gets the current scale
    const currentScale = ref.current?.style.transform
      ? Number(ref.current?.style.transform.split("scale(")[1].split(")")[0])
      : 1;

    const scale = currentScale + 0.5;

    if (scale < 0.1) return;

    // sets the scale and translate
    ref.current!.style.transform = `translate(${currStyle.current.translate.x}px, ${currStyle.current.translate.y}px) scale(${scale})`;

    // sets the current scale
    currStyle.current.scale = scale;
  }, []);

  // ads the escape key functionality
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.shiftKey) return;

      e.preventDefault();
      e.stopPropagation();

      if (e.key === "Escape") {
        handleClose(e);
      } else if (e.key === "ArrowRight") {
        handleNextImg(e);
      } else if (e.key === "ArrowLeft") {
        handlePrevImg(e);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [
    handleClose,
    handleNextImg,
    handlePrevImg,
    handleZoomIn,
    handleZoomOut,
    onClose,
  ]);

  return createPortal(
    <ViewerComp.Wrapper onDoubleClick={handleClose}>
      <ViewerComp.CloseBtn onClick={onClose}>
        <X />
      </ViewerComp.CloseBtn>

      <ViewerComp.ZoomIn onClick={handleZoomIn}>
        <ZoomIn />
      </ViewerComp.ZoomIn>

      <ViewerComp.ZoomOut onClick={handleZoomOut}>
        <ZoomOut />
      </ViewerComp.ZoomOut>

      <ViewerComp.ArrowNext onClick={handleNextImg}>
        <ChevronRight />
      </ViewerComp.ArrowNext>

      <ViewerComp.ArrowPrev onClick={handlePrevImg}>
        <ChevronLeft />
      </ViewerComp.ArrowPrev>

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
        <img ref={imgRef} src={currentImg} />
      </ViewerComp.Container>
    </ViewerComp.Wrapper>,
    document.body
  );
}

export default Viewer;

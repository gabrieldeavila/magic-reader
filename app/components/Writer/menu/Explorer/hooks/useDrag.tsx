import html2canvas from "html2canvas";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import DragSt from "./Drag";

function useDrag({ ref }: { ref: React.RefObject<HTMLElement> }) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragImage, setDragImage] = useState<string | null>(null);

  const dragRef = useRef<HTMLDivElement>(null);

  const handleDragStart = useCallback(() => {
    setIsDragging(true);

    // Create a custom drag image (an element or an image)
    html2canvas(ref.current).then((canvas) => {
      // Set the custom drag image and optionally provide an offset
      setDragImage(canvas.toDataURL());
    });
  }, [ref]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    const handlerMove = (e: MouseEvent) => {
      if (!isDragging) return;

      dragRef.current.style.left = `${e.clientX}px`;
      dragRef.current.style.top = `${e.clientY}px`;
    };

    window.addEventListener("mousemove", handlerMove);

    return () => {
      window.removeEventListener("mousemove", handlerMove);
    };
  }, [isDragging]);

  const DragComponent = useCallback(() => {
    if (!isDragging) return null;

    return createPortal(
      <DragSt.Wrapper ref={dragRef}>
        <img alt="drag-image" src={dragImage} />
      </DragSt.Wrapper>,
      document.body
    );
  }, [dragImage, isDragging]);

  return { DragComponent, handleDragStart, handleDragEnd };
}

export default useDrag;

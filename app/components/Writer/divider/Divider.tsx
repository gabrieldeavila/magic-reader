import React, { useCallback, useEffect, useState } from "react";
import DividerSt from "./style";

function Divider({
  parentRef,
}: {
  parentRef: React.RefObject<HTMLDivElement>;
}) {
  const [isActive, setIsActive] = useState(false);

  const handleMouseDown = useCallback(() => {
    // gets the body and sets the cursor to col-resize
    const body = document.querySelector("body");
    if (body) body.style.cursor = "col-resize";
    setIsActive(true);
  }, []);

  useEffect(() => {
    const dividerLeft = localStorage.getItem("divider_left");
    if (!dividerLeft) return;

    if (!parentRef.current) return;
    parentRef.current.style.width = `${dividerLeft}px`;
  }, [parentRef]);

  useEffect(() => {
    if (!isActive) return;

    const handleMouseUp = () => {
      // gets the body and sets the cursor to default
      const body = document.querySelector("body");
      if (body) body.style.cursor = "default";

      setIsActive(false);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!parentRef.current) return;

      const eventX = e.clientX;
      const dividerLeft = eventX;

      if (dividerLeft < 200 || dividerLeft > 1600) return;
      localStorage.setItem("divider_left", `${dividerLeft}`);
      parentRef.current.style.width = `${dividerLeft}px`;
    };

    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mousemove", handleMouseMove);

    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, [isActive, parentRef]);

  return <DividerSt.Wrapper active={isActive} onMouseDown={handleMouseDown} />;
}

const useDivider = () => {
  const dividerContainerRef = React.useRef<HTMLDivElement>(null);

  return {
    dividerContainerRef,
    Divider: <Divider parentRef={dividerContainerRef} />,
  };
};

export { useDivider };

import React, { useCallback, useEffect, useState } from "react";
import DividerSt from "./style";
import { globalState, stateStorage } from "react-trigger-state";

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

    const ref = globalState.get("writter_ref");
    ref.style.width = `calc(100% - ${dividerLeft}px)`;
  }, [parentRef]);

  const resizeHandler = useCallback(
    (e: MouseEvent) => {
      if (!parentRef.current) return;

      const eventX = e.clientX - 48;
      const dividerLeft = eventX;

      if (
        dividerLeft < 200 ||
        dividerLeft > window.innerWidth - 200 ||
        dividerLeft > window.innerWidth * 0.9 - 50
      ) {
        if (dividerLeft < 0) {
          stateStorage.set("menu", false);

          const body = document.querySelector("body");
          if (body) body.style.cursor = "default";
        }

        return;
      }

      parentRef.current.style.width = `${dividerLeft}px`;

      const ref = globalState.get("writter_ref");
      ref.style.width = `calc(100% - ${dividerLeft}px)`;

      localStorage.setItem("divider_left", `${dividerLeft}`);
    },
    [parentRef]
  );

  useEffect(() => {
    return () => {
      const ref = globalState.get("writter_ref");
      ref.style.width = "100%";
    };
  }, []);

  useEffect(() => {
    if (!isActive) return;

    const handleMouseUp = () => {
      // gets the body and sets the cursor to default
      const body = document.querySelector("body");
      if (body) body.style.cursor = "default";

      setIsActive(false);
    };

    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mousemove", resizeHandler);

    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mousemove", resizeHandler);
    };
  }, [isActive, resizeHandler]);

  useEffect(() => {
    window.addEventListener("resize", resizeHandler);

    return () => {
      window.removeEventListener("resize", resizeHandler);
    };
  }, [resizeHandler]);

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

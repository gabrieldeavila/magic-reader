import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import ContextMenuSt from "./style";

function ContextMenu({
  setShowContextMenu,
  position,
  children,
  avoidClose,
}: {
  setShowContextMenu: React.Dispatch<React.SetStateAction<boolean>>;
  position: { x: number; y: number };
  children: React.ReactNode | React.ReactNode[];
  avoidClose?: boolean;
}) {
  const ref = useRef(null);

  // gets clicks outside
  useEffect(() => {
    const handler = (e) => {
      if (avoidClose) return;

      if (ref.current && ref.current.contains(e.target)) return;

      setShowContextMenu(false);
    };

    document.addEventListener("click", handler);

    // when another folder is clicked, the context menu should be closed
    document.addEventListener("contextmenu", handler);

    // cleanup
    return () => {
      document.removeEventListener("click", handler);
      document.removeEventListener("contextmenu", handler);
    };
  }, [avoidClose, setShowContextMenu]);

  // adds the context where the click was made
  useEffect(() => {
    const { x, y } = position;
    const bounds = ref.current.getBoundingClientRect();
    const isOutOfScreen = bounds.bottom > window.innerHeight;

    ref.current.style.left = `${x}px`;
    ref.current.style.top = `${isOutOfScreen ? y - bounds.height : y}px`;
  }, [position]);

  return createPortal(
    <ContextMenuSt.Wrapper
      ref={ref}
      onContextMenu={(e) => {
        e.stopPropagation();
        e.preventDefault();
      }}
    >
      <ContextMenuSt.Container>{children}</ContextMenuSt.Container>
    </ContextMenuSt.Wrapper>,
    document.body
  );
}

export default ContextMenu;

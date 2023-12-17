import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import ContextMenuSt from "./style";

function ContextMenu({
  setShowContextMenu,
  position,
  children,
}: {
  setShowContextMenu: React.Dispatch<React.SetStateAction<boolean>>;
  position: { x: number; y: number };
  children: React.ReactNode | React.ReactNode[];
}) {
  const ref = useRef(null);

  // gets clicks outside
  useEffect(() => {
    const handler = (e) => {
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
  }, [setShowContextMenu]);

  // adds the context where the click was made
  useEffect(() => {
    const { x, y } = position;

    ref.current.style.left = `${x}px`;
    ref.current.style.top = `${y}px`;
  }, [position]);

  return createPortal(
    <ContextMenuSt.Wrapper ref={ref}>
      <ContextMenuSt.Container>{children}</ContextMenuSt.Container>
    </ContextMenuSt.Wrapper>,
    document.body
  );
}

export default ContextMenu;
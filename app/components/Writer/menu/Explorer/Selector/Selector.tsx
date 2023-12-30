import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import SelectorSt from "./style";
import { useTriggerState } from "react-trigger-state";

function Selector() {
  const isMoving = useRef(false);
  const [menuRef] = useTriggerState({ name: "divider_container_ref" }) as [
    HTMLDivElement,
  ];

  const positions = useRef({
    x: 0,
    y: 0,
    startX: 0,
    startY: 0,
  });

  const selectorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (menuRef == null) return;

    const handlerDowm = (e: MouseEvent) => {
      positions.current.x = e.clientX;
      positions.current.y = e.clientY;

      positions.current.startX = e.clientX;
      positions.current.startY = e.clientY;

      isMoving.current = true;
    };

    const handlerUp = () => {
      isMoving.current = false;
    };

    menuRef?.addEventListener("mousedown", handlerDowm);
    window?.addEventListener("mouseup", handlerUp);

    return () => {
      menuRef?.removeEventListener("mousedowm", handlerDowm);
      window?.removeEventListener("mouseup", handlerUp);
    };
  }, [menuRef]);

  useEffect(() => {
    const handlerMove = (e: MouseEvent) => {
      if (isMoving.current) {
        const menuBounds = menuRef.getBoundingClientRect();

        positions.current.x = e.clientX;
        positions.current.y = e.clientY;

        let width = Math.abs(positions.current.x - positions.current.startX);
        let height = Math.abs(positions.current.y - positions.current.startY);

        let left = positions.current.startX;
        let top = positions.current.startY;

        if (positions.current.x < positions.current.startX) {
          left = positions.current.x;
        }

        if (positions.current.y < positions.current.startY) {
          top = positions.current.y;
        }

        const right = left + width;
        const bottom = top + height;

        // if the user went out of the menu on the right
        if (right > menuBounds.right - 5) {
          width = menuBounds.right - left - 5;
        }

        // and if the user went out of the menu on the left
        if (left < menuBounds.left + 5) {
          left = menuBounds.left + 5;
          width = positions.current.startX - left;
        }

        if (top < menuBounds.top + 5) {
          top = menuBounds.top + 5;
          height = positions.current.startY - top;
        }

        if (bottom > menuBounds.bottom - 5) {
          height = menuBounds.bottom - top - 5;
        }

        selectorRef.current!.style.left = `${left}px`;
        selectorRef.current!.style.top = `${top}px`;

        selectorRef.current!.style.width = `${width}px`;
        selectorRef.current!.style.height = `${height}px`;
      }
    };

    window?.addEventListener("mousemove", handlerMove);

    return () => {
      window?.removeEventListener("mousemove", handlerMove);
    };
  }, [menuRef]);

  return createPortal(<SelectorSt.Wrapper ref={selectorRef} />, document.body);
}

export default Selector;

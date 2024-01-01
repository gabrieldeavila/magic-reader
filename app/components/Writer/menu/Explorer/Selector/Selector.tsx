import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import SelectorSt from "./style";
import { stateStorage, useTriggerState } from "react-trigger-state";

function Selector() {
  const isMoving = useRef(false);
  const [menuRef] = useTriggerState({ name: "divider_container_ref" }) as [
    HTMLDivElement,
  ];
  const canClose = useRef(false);

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
      const isSelector = (e.target as HTMLElement)?.closest("[data-selector]");

      if (isSelector) {
        return;
      }

      positions.current.x = e.clientX;
      positions.current.y = e.clientY;

      positions.current.startX = e.clientX;
      positions.current.startY = e.clientY;

      isMoving.current = true;

      stateStorage.set("show_context_menu", false);
    };

    const handlerUp = () => {
      isMoving.current = false;

      selectorRef.current.style.left = "-9999px";

      setTimeout(() => {
        canClose.current = true;
      }, 0);
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
        canClose.current = false;

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

        stateStorage.set("selector_bounds", {
          left,
          right: left + width,
          top,
          bottom,
          width,
          height,
        });
      }
    };

    window?.addEventListener("mousemove", handlerMove);

    return () => {
      window?.removeEventListener("mousemove", handlerMove);
    };
  }, [menuRef]);

  // when there's a click, close the selector
  useEffect(() => {
    const handlerClick = () => {
      if (!canClose.current) return;

      selectorRef.current!.style.width = "0px";
      selectorRef.current!.style.height = "0px";

      stateStorage.set("selector_bounds", {});
    };

    window?.addEventListener("click", handlerClick);

    return () => {
      window?.removeEventListener("click", handlerClick);
    };
  }, []);

  return createPortal(<SelectorSt.Wrapper ref={selectorRef} />, document.body);
}

export default Selector;

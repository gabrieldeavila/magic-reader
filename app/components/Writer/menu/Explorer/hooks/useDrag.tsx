import html2canvas from "html2canvas";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { globalState, stateStorage } from "react-trigger-state";
import DragSt from "./Drag";
import DROP from "../../../_commands/DROP";

function useDrag({
  ref,
  id,
  isFile,
}: {
  ref: React.RefObject<HTMLElement>;
  id: number;
  isFile?: boolean;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragImage, setDragImage] = useState<string | null>(null);

  const dragRef = useRef<HTMLDivElement>(null);

  const getOtherItems = useCallback(() => {
    const files = Object.keys(globalState.get("explorer-selected-files") || {});
    const folders = Object.keys(
      globalState.get("explorer-selected-folders") || {}
    );

    return files.length + folders.length - 1;
  }, []);

  const isLonely = useRef(false);

  const dragStartTimer = useRef<NodeJS.Timeout | null>(null);

  const handleDragStart = useCallback(() => {
    setIsDragging(true);

    dragStartTimer.current = setTimeout(() => {
      const clone = ref.current?.cloneNode(true) as HTMLElement;

      const isSelected = isFile
        ? globalState.get("explorer-selected-files")?.[id]
        : globalState.get("explorer-selected-folders")?.[id];

      isLonely.current = !isSelected;

      const container = document.createElement("div");
      container.style.width = "175px";
      container.style.border = "1px solid var(--glowShadow)";
      container.style.borderRadius = "5px"; // Set your desired border radius

      // Append the container and the original content
      container.appendChild(clone);

      if (!isSelected) {
        stateStorage.set("selector_bounds", {});
      }

      // number of selected items
      const selectedItems = getOtherItems();

      if (isSelected && selectedItems > 0) {
        // add in the container the number of selected items
        const span = document.createElement("span");
        span.innerText = `+${selectedItems}`;
        span.style.position = "absolute";
        span.style.top = "0";
        span.style.bottom = "0";
        span.style.right = "0";
        span.style.padding = "5px";
        span.style.display = "flex";
        span.style.alignItems = "center";
        span.style.justifyContent = "center";
        span.style.backgroundColor = "var(--outline)";
        span.style.color = "var(--contrast)";
        span.style.fontSize = "12px";
        span.style.fontWeight = "bold";
        span.style.zIndex = "1";
        container.appendChild(span);
      }

      container.style.position = "relative";
      container.style.overflow = "hidden";

      // append container on the body
      document.body.appendChild(container);

      // Create a custom drag image (an element or an image)
      html2canvas(container, {
        allowTaint: true,
        backgroundColor: "transparent",
      })
        .then((canvas) => {
          // Set the custom drag image and optionally provide an offset
          setDragImage(canvas.toDataURL());
        })
        .catch((err) => {
          console.log(err);
        });

      // remove the container from the body
      document.body.removeChild(container);
    }, 100);
  }, [getOtherItems, id, isFile, ref]);

  const handleDragEnd = useCallback(() => {
    // prevent the click event from firing
    clearTimeout(dragStartTimer.current);

    if (!isDragging) return;

    setIsDragging(false);
    setDragImage(null);

    let folderId = stateStorage.get("folder_drag_hover");

    stateStorage.set("folder_drag_hover", null);

    if (!folderId) {
      folderId = -1;
    }

    let filesToMove = Object.keys(
      globalState.get("explorer-selected-files") || {}
    );

    if (isLonely.current && isFile) {
      filesToMove = [id.toString()];
    }

    let foldersToMove = Object.keys(
      globalState.get("explorer-selected-folders") || {}
    );

    filesToMove = filesToMove.filter((file) => {
      const fileFolderId = globalState
        .get("explorer-selected-files")
        ?.[file]?.folderId.toString();

      // if the folderId is in the folderToMove array, don't move the file
      return !foldersToMove.includes(fileFolderId);
    });

    if (isLonely.current && !isFile) {
      foldersToMove = [id.toString()];
    }

    DROP({
      toFolderId: folderId,
      filesId: filesToMove,
      foldersIds: foldersToMove,
    });
  }, [id, isDragging, isFile]);

  useEffect(() => {
    if (!ref.current) return;

    const element = ref.current;

    element.addEventListener("mousedown", handleDragStart);
    window.addEventListener("mouseup", handleDragEnd);

    return () => {
      element?.removeEventListener("mousedown", handleDragStart);
      window?.removeEventListener("mouseup", handleDragEnd);
    };
  }, [handleDragEnd, handleDragStart, isDragging, ref]);

  useEffect(() => {
    const handlerMove = (e: MouseEvent) => {
      if (!isDragging || !dragImage) return;

      dragRef.current.style.left = `${e.clientX}px`;
      dragRef.current.style.top = `${e.clientY}px`;

      // sees if the mouse is over some folder
      let folder = document.elementFromPoint(e.clientX - 5, e.clientY);

      if (!folder.getAttribute("data-folder-select")) {
        folder = folder.closest("[data-folder-select]");
      }

      const folderId = folder?.getAttribute("data-folder-select");

      stateStorage.set("folder_drag_hover", folderId);
    };

    window.addEventListener("mousemove", handlerMove);

    return () => {
      window.removeEventListener("mousemove", handlerMove);
    };
  }, [dragImage, isDragging]);

  const DragComponent = useCallback(() => {
    if (!isDragging || !dragImage) return null;

    return createPortal(
      <DragSt.Wrapper ref={dragRef}>
        <img alt="drag-image" src={dragImage} />
      </DragSt.Wrapper>,
      document.body
    );
  }, [dragImage, isDragging]);

  return { DragComponent };
}

export default useDrag;

import React from "react";
import { createPortal } from "react-dom";

function ContextMenu() {
  return createPortal(
    <div className="context-menu">
      <div className="context-menu__item">New File</div>
      <div className="context-menu__item">New Folder</div>
      <div className="context-menu__item">Rename</div>
      <div className="context-menu__item">Delete</div>
    </div>,
    document.body
  );
}

export default ContextMenu;

import React, { useCallback, useEffect, useState } from "react";
import DividerSt from "./style";

function Divider() {
  const [isActive, setIsActive] = useState(false);

  const handleMouseDown = useCallback(() => {
    setIsActive(true);
  }, []);

  useEffect(() => {
    if (!isActive) return;

    const handleMouseUp = () => {
      setIsActive(false);
    };

    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isActive]);

  return <DividerSt.Wrapper active={isActive} onMouseDown={handleMouseDown} />;
}

const useDivider = () => {
  const dividerContainerRef = React.useRef<HTMLDivElement>(null);

  return {
    dividerContainerRef,
    Divider,
  };
};

export { useDivider };

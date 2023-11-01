import React, { useEffect } from "react";

const MAX_WIDTH = 800;

function useResize(ref: React.MutableRefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const handleResize = () => {
      if (ref.current == null) return;

      const width = ref.current.offsetWidth;

      if (width > MAX_WIDTH) {
        ref.current.style.width = `${MAX_WIDTH}px`;
      } else {
        ref.current.style.width = "100%";
      }
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, [ref]);
}

export default useResize;

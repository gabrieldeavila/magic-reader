"use client";

import React, { useMemo, useState } from "react";
import Phrase from "./Phrase";

function Example() {
  const [textArea, setTextArea] = useState("");

  const lines = useMemo(() => {
    return textArea.split("\n") || [];
  }, [textArea]);

  return (
    <div>
      <textarea
        value={textArea}
        onChange={(e) => setTextArea(e.target.value)}
        style={{
          background: "var(--primary)",
          borderRadius: "5px",
          color: "var(--contrast)",
        }}
      />
      {lines.map((line, index) => (
        <Phrase key={index} index={index} phrase={line} />
      ))}
    </div>
  );
}

export default Example;

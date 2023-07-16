import { useMemo } from "react";

function Letter({
  letter,
  boldLetters,
  index,
}: {
  letter: string;
  boldLetters: number[];
  index: number;
}) {
  const isBold = useMemo(
    () => boldLetters.includes(index),
    [boldLetters, index]
  );

  return (
    <span
      style={{
        fontSize: isBold ? "1.25rem" : "1rem",
        fontWeight: isBold ? "bold" : "normal",
      }}
    >
      {letter}
    </span>
  );
}

export default Letter;

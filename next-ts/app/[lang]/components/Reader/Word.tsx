import { useMemo } from "react";
import Letter from "./Letter";

function Word({ word }: { word: string }) {
  const letters = useMemo(() => word.split(""), [word]);

  // 50% of the letters are bold
  const boldLetters = useMemo(() => {
    // ex. 6 letters, 50% = 3
    const shouldBold = Math.floor(letters.length * 0.5);

    // now, randomly select 3 letters to bold
    const boldLetters = [];
    for (let i = 0; i < shouldBold; i++) {
      const randomIndex = Math.floor(Math.random() * letters.length);
      boldLetters.push(randomIndex);
    }

    return boldLetters;
  }, [letters]);

  return (
    <div>
      {letters.map((letter, index) => (
        <Letter
          key={index}
          boldLetters={boldLetters}
          index={index}
          letter={letter}
        />
      ))}
    </div>
  );
}

export default Word;

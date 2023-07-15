import { useMemo } from "react";
import Letter from "./Letter";
import { Space } from "@geavila/gt-design";

function Word({ word }: { word: string }) {
  const letters = useMemo(() => word.split(""), [word]);

  // 50% of the letters are bold
  const boldLetters = useMemo(() => {
    // ex. 6 letters, 50% = 3.9, so 3 letters should be bold
    const shouldBold = Math.floor(letters.length * 0.5);

    // now, randomly select 3 letters to bold
    const boldLetters = [];
    for (let i = 0; i < shouldBold; i++) {
      // avoids bolding consecutive letters
      let index = Math.floor(Math.random() * letters.length);
      let loopingFor = 0;

      const verify = () => {
        if (loopingFor > 20) {
          return false;
        }

        loopingFor++;

        if (boldLetters.length > 0) {
          if (
            boldLetters.includes(index - 1) ||
            boldLetters.includes(index + 1) ||
            boldLetters.includes(index)
          ) {
            return true;
          }
        }
        return false;
      };

      while (verify()) {
        index = Math.floor(Math.random() * letters.length);
      }

      boldLetters.push(index);
    }

    return boldLetters;
  }, [letters]);

  return (
    <div style={{ whiteSpace: "nowrap" }}>
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

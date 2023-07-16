import React, { useCallback } from "react";
type Convert = ({ name }: { name: string }) => string;

function useBookName() {
  /**
   * @description Convert the name of the book to a more readable format
   * @param {string} name
   * @returns {string}
   * @example
   * const name = "THE_LORD_OF_THE_RINGS"
   * const readableName = convertName(name)
   * console.log(readableName) // The Lord Of The Rings
   *
   * const name = "ThE-lOrD_oF_tHe_rInGs sOmEthing"
   * const readableName = convertName(name)
   * console.log(readableName) // The Lord Of The Rings Something
   */
  const convertName = useCallback<Convert>(({ name }) => {
    const words = name.toLowerCase().split(/[_\s-]+/);
    const capitalizedWords = words.map(
      (word) => word.charAt(0).toUpperCase() + word.slice(1)
    );
    return capitalizedWords.join(" ");
  }, []);

  return { convertName };
}

export default useBookName;

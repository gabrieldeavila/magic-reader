import React, { memo, useCallback, useEffect } from "react";
import { useTriggerState } from "react-trigger-state";
import { db } from "../Dexie/Dexie";
import { Box, MotionBox, Space, Text, Zinc } from "@geavila/gt-design";

function Books() {
  const [books, setBooks] = useTriggerState({
    name: "books",
    initial: [],
  });

  useEffect(() => {
    db.pdfs.toArray().then((pdfs) => setBooks(pdfs));
  }, []);

  return (
    <Space.Modifiers mt="1rem" display="grid">
      <Box.Column>
        {books.map((book) => (
          <Book book={book} />
        ))}
      </Box.Column>
    </Space.Modifiers>
  );
}

export default Books;

const Book = memo(({ book }: { book: any }) => {
  const [font] = useTriggerState({ name: "font" });

  const handleClick = useCallback(() => {
    console.log("click");
  }, []);

  return (
    <MotionBox onClick={handleClick} title="LEGERE.READ_BOOK" key={book}>
      <Space.MiddleCenter>
        <Text.P className={font}>{book.name}</Text.P>
      </Space.MiddleCenter>
    </MotionBox>
  );
});

import React, { useEffect } from "react";
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
          <MotionBox title="red" key={book}>
            <Space.MiddleCenter>
              <Text.P>{book.name}</Text.P>
            </Space.MiddleCenter>
          </MotionBox>
        ))}
      </Box.Column>
    </Space.Modifiers>
  );
}

export default Books;

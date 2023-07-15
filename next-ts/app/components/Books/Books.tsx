import React, { memo, useCallback, useEffect, useMemo } from "react";
import { stateStorage, useTriggerState } from "react-trigger-state";
import { db } from "../Dexie/Dexie";
import {
  Box,
  MotionBox,
  Space,
  Text,
  Zinc,
  useGTTranslate,
} from "@geavila/gt-design";
import useBookName from "../../hooks/useBookName";
import { useRouter } from "next/navigation";

function Books() {
  const { translateThis } = useGTTranslate();

  const [books, setBooks] = useTriggerState({
    name: "books",
    initial: [],
  });

  useEffect(() => {
    db.pdfs.toArray().then((pdfs) => setBooks(pdfs));
  }, []);

  return (
    <Space.Modifiers mt="1rem" display="grid">
      <Text.Strong mb="1rem">{translateThis("LEGERE.BOOKS")}</Text.Strong>
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
  const { translateThis } = useGTTranslate();
  const { convertName } = useBookName();
  const router = useRouter();

  const handleClick = useCallback(() => {
    const page = stateStorage.get("lang");

    router.push(`${page}/legere/${book.id}/`);
  }, []);

  const convertedName = useMemo(
    () => convertName({ name: book.name }),
    [book.name]
  );

  return (
    <MotionBox onClick={handleClick} title="LEGERE.READ_BOOK" key={book}>
      <Space.MiddleCenter>
        <Text.P textAlign="center" className={font}>
          {convertedName}
        </Text.P>
        <Text.P className={font}>
          {translateThis("LEGERE.NUM_OF_PAGES", { PAGES: book.numOfPages })}
        </Text.P>
      </Space.MiddleCenter>
    </MotionBox>
  );
});

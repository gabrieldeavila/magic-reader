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
import Link from "next/link";

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
  const [page] = useTriggerState({ name: "lang" });
  const { translateThis } = useGTTranslate();
  const { convertName } = useBookName();

  const convertedName = useMemo(
    () => convertName({ name: book.name }),
    [book.name]
  );
  console.log(page);
  return (
    <Link href={`/${page}/legere/${book.id}/`}>
      <MotionBox title="LEGERE.READ_BOOK" key={book}>
        <Space.MiddleCenter>
          <Text.P textAlign="center" className={font}>
            {convertedName}
          </Text.P>
          <Text.P className={font}>
            {translateThis("LEGERE.NUM_OF_PAGES", { PAGES: book.numOfPages })}
          </Text.P>
        </Space.MiddleCenter>
      </MotionBox>
    </Link>
  );
});

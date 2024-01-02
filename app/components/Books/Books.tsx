import {
  Box,
  Loader,
  MotionBox,
  Space,
  Text,
  useGTTranslate,
} from "@geavila/gt-design";
import Link from "next/link";
import { memo, useEffect, useMemo } from "react";
import { useTriggerState } from "react-trigger-state";
import useBookName from "../../hooks/useBookName";
import useIsSSR from "../../hooks/useIsSSR";
import { db } from "../Dexie/Dexie";

function Books() {
  const { translateThis } = useGTTranslate();

  const [books, setBooks] = useTriggerState({
    name: "books",
    initial: [],
  });

  useEffect(() => {
    db.pdfs.toArray().then((pdfs) => setBooks(pdfs));
  }, [setBooks]);

  const { isSSR } = useIsSSR();

  return (
    <Space.Modifiers mt="1rem" display="grid">
      {/* <Text.Strong mb="1rem">{translateThis("LEGERE.BOOKS")}</Text.Strong> */}

      {isSSR && <Loader.Simple />}

      {!books.length && !isSSR && (
        <Text.P>{translateThis("LEGERE.NO_BOOKS")}</Text.P>
      )}

      <Box.Column>
        {books.map((book, index) => (
          <Book book={book} key={index} />
        ))}
      </Box.Column>
    </Space.Modifiers>
  );
}

export default Books;

const Book = memo(({ book }: { book: Record<string, string> }) => {
  const [font] = useTriggerState({ name: "font" });
  const [page] = useTriggerState({ name: "lang" });
  const { translateThis } = useGTTranslate();
  const { convertName } = useBookName();

  const convertedName = useMemo(
    () => convertName({ name: book.name }),
    [book.name, convertName]
  );

  return (
    // @ts-expect-error - do later
    <MotionBox title="LEGERE.READ_BOOK" key={book}>
      <Link
        style={{ height: "100%", textDecoration: "none" }}
        prefetch
        href={`/${page}/legere/${book.id}/`}
      >
        <Space.MiddleCenter>
          <Text.P className={font}>{convertedName}</Text.P>
          <Text.P className={font}>
            {translateThis("LEGERE.NUM_OF_PAGES", { PAGES: book.numOfPages })}
          </Text.P>
        </Space.MiddleCenter>
      </Link>
    </MotionBox>
  );
});

Book.displayName = "Book";

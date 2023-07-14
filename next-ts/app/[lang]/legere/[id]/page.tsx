"use client";

import React, { useEffect, useMemo, useState } from "react";
import { db } from "../../../components/Dexie/Dexie";
import { stateStorage } from "react-trigger-state";
import Reader from "../../../components/Reader/Reader";

function edit({ params: { id } }) {
  const [currentBook, setCurrentBook] = useState({});
  useEffect(() => {
    if (!id) return;
    db.pdfs.get({ id: parseInt(id) }).then((book) => {
      setCurrentBook(book);
      console.log(book);
      stateStorage.set("reading_book", book);
    });
  }, []);

  return (
    <div>
      <Reader />
    </div>
  );
}

export default edit;

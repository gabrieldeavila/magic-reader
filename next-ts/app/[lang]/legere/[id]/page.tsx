"use client";

import React, { useEffect, useMemo, useState } from "react";
import { db } from "../../../components/Dexie/Dexie";
import { stateStorage } from "react-trigger-state";
import Reader, { ReaderModal } from "../../../components/Reader/Reader";

function edit({ params: { id } }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    db.pdfs.get({ id: parseInt(id) }).then((book) => {
      setLoading(false);
      stateStorage.set("reading_book", book);
    });
  }, [id]);

  if (loading) return null;

  return (
    <>
      <Reader />
      <ReaderModal />
    </>
  );
}

export default edit;

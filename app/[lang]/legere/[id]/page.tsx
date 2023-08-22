"use client";

import { useEffect, useState } from "react";
import { stateStorage } from "react-trigger-state";
import { db } from "../../../components/Dexie/Dexie";
import Reader from "../../../components/Reader/Reader";
import useNoThemeChange from "../../../hooks/useNoThemeChange";

function Edit({
  params: { id },
}: {
  params: {
    id: string;
  };
}) {
  const [loading, setLoading] = useState(true);
  useNoThemeChange();

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
    </>
  );
}

export default Edit;

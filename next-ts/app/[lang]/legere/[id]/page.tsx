"use client";

import React, { useEffect, useMemo, useState } from "react";
import { db } from "../../../components/Dexie/Dexie";
import { stateStorage } from "react-trigger-state";
import Reader from "../../../components/Reader/Reader";

function edit({ params: { id } }) {
  useEffect(() => {
    if (!id) return;
    db.pdfs.get({ id: parseInt(id) }).then((book) => {
      stateStorage.set("reading_book", book);
    });
  }, [id]);

  return <Reader />;
}

export default edit;

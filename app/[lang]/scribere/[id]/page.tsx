"use client";

import React, { useEffect, useState } from "react";
import Editor from "../../../components/Writer/editor/Editor";
import { db } from "../../../components/Dexie/Dexie";

function Page({ params: { id } }: { params: { id: string } }) {
  const [content, setContent] = useState([]);

  useEffect(() => {
    (() => {
      console.log("hoho");

      db.scribere.get({ id: parseInt(id) }).then((data) => {
        console.log("data", data);

        if (!data) return;
        console.log(data.content);
        setContent(data.content);
      });
    })();
  }, [id]);

  return <Editor content={content} />;
}

export default Page;

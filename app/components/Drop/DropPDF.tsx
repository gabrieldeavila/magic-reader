/* eslint-disable multiline-ternary */
import { Loader, Text, useGTTranslate } from "@geavila/gt-design";
import { useCallback, useState } from "react";
import Dropzone from "react-dropzone";
import { stateStorage, useTriggerState } from "react-trigger-state";
import { db } from "../Dexie/Dexie";
import "./style.css";

type uploadFileReturn = {
  name: string;
  pages: Record<string, string>;
  numOfPages: number;
};

function DropPDF({
  uploadFile,
}: {
  uploadFile: (formData: FormData) => Promise<uploadFileReturn>;
}) {
  const [loading, setLoading] = useState(false);
  const { translateThis } = useGTTranslate();
  const [font] = useTriggerState({ name: "font" });

  const handleDrop = useCallback((acceptedFiles: Record<string, string>) => {
    void (async () => {
      setLoading(true);

      const formData = new FormData();
      formData.append("pdf", acceptedFiles[0]);

      const data = await uploadFile?.(formData);

      const { name, pages, numOfPages } = data;
      const newBook = {
        name,
        pages,
        numOfPages,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // @ts-expect-error - uh
      const id = await db.pdfs.add(newBook);

      const allBooks = stateStorage.get("books");

      stateStorage.set("books", [...allBooks, { ...newBook, id }]);
      setLoading(false);
    })();
  }, [uploadFile]);

  return (
    <>
      <Dropzone
        // @ts-expect-error - uh
        onDrop={handleDrop}
        disabled={loading}
        accept={{ "application/pdf": ["application/pdf"] }}
      >
        {({
          getRootProps,
          getInputProps,
          isDragAccept,
          isDragReject,
          isDragActive,
        }) => (
          <div {...getRootProps()} className="drop-zone-wrapper">
            <section>
              <input {...getInputProps()} />
              <Text.P className={font}>
                {loading ? (
                  <Loader.Simple />
                ) : (
                  <>
                    {isDragAccept && translateThis("LEGERE.DROP_ACCEPT")}
                    {isDragReject && translateThis("LEGERE.DROP_REJECT")}
                    {!isDragActive && translateThis("LEGERE.DROP")}
                  </>
                )}
              </Text.P>
            </section>
          </div>
        )}
      </Dropzone>
    </>
  );
}

export default DropPDF;

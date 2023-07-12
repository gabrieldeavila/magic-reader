/* eslint-disable multiline-ternary */
import Dropzone from "react-dropzone";
import { useCallback, useState, useTransition } from "react";
import "./style.css";
import { Loader, Text, useGTTranslate } from "@geavila/gt-design";
import { useNavigate } from "react-router-dom";
import { stateStorage, useTriggerState } from "react-trigger-state";
import { getFileInfo } from "../../actions/drop/getFileInfo";

function DropPDF() {
  const [loading, setLoading] = useState(false);
  const { translateThis } = useGTTranslate();
  const [font] = useTriggerState({ name: "font" });

  const handleDrop = useCallback((acceptedFiles: any) => {
    void (async () => {
      setLoading(true);

      const formData = new FormData();
      formData.append("pdf", acceptedFiles[0]);
      // startTransition(async () => {
      const { data } = await getFileInfo({ formData });
      console.log(data);
      setLoading(false);
      // });
    })();
  }, []);

  return (
    <>
      <Dropzone
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
              <Text.P color="var(--primary)" className={font}>
                {loading ? (
                  <Loader.Simple color="var(--primary)" />
                ) : (
                  <>
                    {isDragAccept && translateThis("DROP_ACCEPT")}
                    {isDragReject && translateThis("DROP_REJECT")}
                    {!isDragActive && translateThis("DROP")}
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

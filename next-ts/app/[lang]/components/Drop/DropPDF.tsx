/* eslint-disable multiline-ternary */
import Dropzone from "react-dropzone";
import { useCallback, useState, useTransition } from "react";
import "./style.css";
import { Loader, Loading } from "@geavila/gt-design";
import { useNavigate } from "react-router-dom";
import { stateStorage } from "react-trigger-state";
import apiReader from "../../../Axios/apiReader";
import { getFileInfo } from "../../../actions/drop/getFileInfo";

function DropPDF() {
  const [loading, setLoading] = useState(false);
  const [isPending, startTransition] = useTransition();

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
              <p className="drop-zone-text">
                {loading ? (
                  <Loader.Simple color="var(--primary)" />
                ) : (
                  <>
                    {/* {isDragAccept && t("DROP_ACCEPT")}
                    {isDragReject && t("DROP_REJECT")}
                    {!isDragActive && t("DROP")} */}
                    aaa
                  </>
                )}
              </p>
            </section>
          </div>
        )}
      </Dropzone>
    </>
  );
}

export default DropPDF;

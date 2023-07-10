/* eslint-disable multiline-ternary */
import Dropzone from "react-dropzone";
import { useCallback, useState } from "react";
import "./style.css";
import apiReader from "../../Axios/apiReader";
import useTranslate from "../Translate/useTranslate";
import { Loader, Loading } from "@geavila/gt-design";
import { useNavigate } from "react-router-dom";
import { stateStorage } from "react-trigger-state";

function DropPDF() {
  const t = useTranslate();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleDrop = useCallback((acceptedFiles: any) => {
    void (async () => {
      setLoading(true);
      const formData = new FormData();
      formData.append("pdf", acceptedFiles[0]);

      await apiReader
        .post("/reader/pdf-to-array", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((res) => {
          stateStorage.set("pdf", res.data);
          navigate("/reader");
        })
        .catch((err) => console.log(err))
        .finally(() => setLoading(false));
    })();
  }, [navigate]);

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
                    {isDragAccept && t("DROP_ACCEPT")}
                    {isDragReject && t("DROP_REJECT")}
                    {!isDragActive && t("DROP")}
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

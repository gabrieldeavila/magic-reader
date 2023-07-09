import Dropzone from "react-dropzone";
import { useCallback } from "react";
import "./style.css";
import apiReader from "../../Axios/apiReader";
import useTranslate from "../Translate/useTranslate";

function DropPDF() {
  const t = useTranslate();

  const handleDrop = useCallback((acceptedFiles: any) => {
    void (async () => {
      const formData = new FormData();
      formData.append("pdf", acceptedFiles[0]);
      console.log(formData);

      await apiReader
        .post("/reader/pdf-to-array", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((res) => console.log(res))
        .catch((err) => console.log(err));
    })();
  }, []);

  return (
    <Dropzone
      onDrop={handleDrop}
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
              {isDragAccept && t("DROP_ACCEPT")}
              {isDragReject && t("DROP_REJECT")}
              {!isDragActive && t("DROP")}
            </p>
          </section>
        </div>
      )}
    </Dropzone>
  );
}

export default DropPDF;

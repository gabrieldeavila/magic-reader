import Dropzone from "react-dropzone";
import { useCallback } from "react";
import "./style.css";
import { useTranslation } from "react-i18next";

function DropPDF() {
  // @ts-expect-error idk
  const { t } = useTranslation();

  const handleDrop = useCallback((acceptedFiles: any) => {
    console.log(acceptedFiles);
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

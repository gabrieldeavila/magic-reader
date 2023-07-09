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
    <Dropzone onDrop={handleDrop}>
      {({ getRootProps, getInputProps }) => (
        <div className="drop-zone-wrapper">
          <section>
            <div {...getRootProps()}>
              <input {...getInputProps()} />
              <p className="drop-zone-text">{t("DROP")}</p>
            </div>
          </section>
        </div>
      )}
    </Dropzone>
  );
}

export default DropPDF;

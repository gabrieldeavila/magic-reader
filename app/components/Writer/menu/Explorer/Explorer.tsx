import { useEffect } from "react";
import { FilePlus, FolderPlus } from "react-feather";
import { db } from "../../../Dexie/Dexie";
import MenuSt from "../style";
import { useGTTranslate } from "@geavila/gt-design";

function Explorer() {
  useEffect(() => {
    (async () => {
      const val = await db.scribere.where("folderId").equals(-1).toArray();

      console.log(val);
    })();
  }, []);

  const { translateThis } = useGTTranslate();

  return (
    <MenuSt.Title.Content>
      <MenuSt.Title.Name>{translateThis("SCRIBERE.EXPLORER")}</MenuSt.Title.Name>
      <MenuSt.Title.Options>
        <MenuSt.Title.Option title={translateThis("SCRIBERE.NEW_FILE")}>
          <FilePlus size={16} />
        </MenuSt.Title.Option>
        <MenuSt.Title.Option title={translateThis("SCRIBERE.NEW_FOLDER")}>
          <FolderPlus size={16} />
        </MenuSt.Title.Option>
      </MenuSt.Title.Options>
    </MenuSt.Title.Content>
  );
}

export default Explorer;

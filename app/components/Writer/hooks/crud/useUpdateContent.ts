import { useCallback } from "react";
import { db } from "../../../Dexie/Dexie";
import { IWritterContent } from "../../interface";

function useUpdateContent({ id }: { id: string }) {
  const updateContent = useCallback(
    (content: IWritterContent[]) => {
      console.log(content);

      db.scribere.update(parseInt(id), { content }).then((res) => {
        console.log(res, "Lol");
      });
    },
    [id]
  );

  return {
    updateContent,
  };
}

export default useUpdateContent;

import { useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";
import CREATE_SCRIBERE from "../../_commands/file/CREATE";
import {
  globalState,
  stateStorage,
  useTriggerState,
} from "react-trigger-state";
import randomAlias from "../../utils/randomAlias";
import { useGTTranslate } from "@geavila/gt-design";

function useShortcuts() {
  const router = useRouter();
  const [lang] = useTriggerState({ name: "lang" });
  const { translateThis } = useGTTranslate();

  // when alt + n is pressed, it will trigger this function
  useEffect(() => {
    const handleNewFile = async (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLocaleLowerCase() === "n") {
        e.preventDefault();
        e.stopPropagation();

        const parentId = globalState.get("selected_folder");

        const newScribere = await CREATE_SCRIBERE(
          translateThis(randomAlias()),
          parentId
        );

        const currScriberes = globalState.get(`explorer_scribere_${parentId}`);

        stateStorage.set(`explorer_scribere_${parentId}`, [
          ...currScriberes,
          newScribere,
        ]);

        router.push(`/${lang}/scribere/${newScribere.id}`);
      }
    };

    document.addEventListener("keydown", handleNewFile);

    return () => {
      document.removeEventListener("keydown", handleNewFile);
    };
  }, [lang, router, translateThis]);
}

export default useShortcuts;

export const useIsAShortcut = () => {
  const is = useCallback((e: KeyboardEvent) => {
    if (e.altKey && e.key.toLocaleLowerCase() === "n") {
      return true;
    }
  }, []);

  return is;
};

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import CREATE_SCRIBERE from "../../_commands/file/CREATE";
import { useTriggerState } from "react-trigger-state";

function useShortcuts() {
  const router = useRouter();
  const [lang] = useTriggerState({ name: "lang" });

  // when alt + n is pressed, it will trigger this function
  useEffect(() => {
    const handleNewFile = async (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLocaleLowerCase() === "n") {
        e.preventDefault();

        const { id } = await CREATE_SCRIBERE();
        router.push(`/${lang}/scribere/${id}`);
      }
    };

    document.addEventListener("keydown", handleNewFile);

    return () => {
      document.removeEventListener("keydown", handleNewFile);
    };
  }, [lang, router]);
}

export default useShortcuts;

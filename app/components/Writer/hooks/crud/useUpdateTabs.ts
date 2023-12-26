import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { stateStorage, useTriggerState } from "react-trigger-state";

function useUpdateTabs() {
  const [lang] = useTriggerState({ name: "lang" });
  const router = useRouter();

  const handleUpdateTabs = useCallback(
    ({ isActive, id }: { id: number | string; isActive: boolean }) => {
      if (isActive) {
        stateStorage.set("active_tab", null);
      }

      const currTabs = stateStorage.get("tabs");
      const newTabs = currTabs.filter((tab: any) => tab.id !== id);

      stateStorage.set("tabs", newTabs);

      if (!isActive) return;

      if (isActive && newTabs.length === 0) {
        router.push(`/${lang}/scribere`);
      } else {
        const newActiveTab = newTabs[newTabs.length - 1];
        router.push(`/${lang}/scribere/${newActiveTab.id}`);
      }
    },
    [lang, router]
  );

  return handleUpdateTabs;
}

export default useUpdateTabs;

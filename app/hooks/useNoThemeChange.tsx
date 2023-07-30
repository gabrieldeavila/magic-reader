import { useEffect } from "react";
import { stateStorage } from "react-trigger-state";

function useNoThemeChange() {
  useEffect(() => {
    stateStorage.set("no_theme_change", true);

    return () => {
      stateStorage.set("no_theme_change", false);
    };
  }, []);
}

export default useNoThemeChange;

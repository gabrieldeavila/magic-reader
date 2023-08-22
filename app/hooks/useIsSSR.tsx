import { useEffect } from "react";
import { useTriggerState } from "react-trigger-state";

function useIsSSR() {
  const [isSSR, setIsSSR] = useTriggerState({ name: "isSSR", initial: true });

  useEffect(() => {
    setIsSSR(false);
  }, [setIsSSR]);

  return { isSSR };
}

export default useIsSSR;

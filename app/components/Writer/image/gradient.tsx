import { useCallback, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { RefreshCcw } from "react-feather";
import { stateStorage, useTriggerState } from "react-trigger-state";
import { RANDOM_BACKGROUND } from "../_commands/color/RANDOM";
import { useContextName } from "../context/WriterContext";
import { UnsplashSty } from "./style";

function Gradient() {
  const contextName = useContextName();
  const [key, setKey] = useState(0);

  const [portalRef] = useTriggerState({ name: "image_options_ref" });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const gradients = useMemo(() => RANDOM_BACKGROUND(6), [key]);

  const newGradient = useCallback(() => {
    setKey((prev) => prev + 1);
  }, []);

  const handleClick = useCallback(
    (gradient) => {
      stateStorage.set(`${contextName}_img`, gradient);
      stateStorage.set("show_img", false);
    },
    [contextName]
  );

  return (
    <UnsplashSty.Container style={{ gap: "1rem 0.5rem" }}>
      {createPortal(
        <RefreshCcw onClick={newGradient} cursor="pointer" size={15} />,
        portalRef as HTMLDivElement
      )}

      {gradients.map((gradient, index) => (
        <UnsplashSty.ImgWrapper
          onClick={() => handleClick(gradient)}
          key={index}
        >
          <UnsplashSty.Gradient
            style={{
              background: `linear-gradient(${gradient.deg}deg, ${gradient.top} 0%, ${gradient.bottom} 100%)`,
            }}
          />
        </UnsplashSty.ImgWrapper>
      ))}
    </UnsplashSty.Container>
  );
}

export default Gradient;

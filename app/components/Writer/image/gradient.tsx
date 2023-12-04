import { useCallback } from "react";
import { stateStorage } from "react-trigger-state";
import { useContextName } from "../context/WriterContext";
import { UnsplashSty } from "./style";

const gradients = [
  {
    top: "#61A3E6",
    bottom: "#63E2FF",
    deg: 180,
  },
  {
    top: "#FF7E5F",
    bottom: "#FFB56E",
    deg: 180,
  },
  {
    top: "#5A3F37",
    bottom: "#7A6332",
    deg: 90,
  },
  {
    top: "#8A2387",
    bottom: "#E94057",
    deg: 45,
  },
  {
    top: "#FFD700",
    bottom: "#FF9800",
    deg: 270,
  },
  {
    top: "#FF5F6D",
    bottom: "#FFC371",
    deg: 75,
  },
];

function Gradient() {
  const contextName = useContextName();

  const handleClick = useCallback((gradient) => {
    stateStorage.set(`${contextName}_img`, gradient);
    stateStorage.set("show_img", false);
  }, [contextName]);

  return (
    <UnsplashSty.Container style={{ gap: "1rem 0.5rem" }}>
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

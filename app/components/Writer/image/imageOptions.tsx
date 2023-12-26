import { Space, useGTTranslate } from "@geavila/gt-design";
import { X } from "react-feather";
import { globalState, stateStorage } from "react-trigger-state";
import Gradient from "./gradient";
import { UnsplashSty } from "./style";
import { useCallback, useState } from "react";
import Unsplash from "./unsplash";

function ImageOptions() {
  const { translateThis } = useGTTranslate();
  const [tabShow, setTabShow] = useState<"GRADIENT" | "UNSPLASH">("GRADIENT");

  const handleClick = (tab: "GRADIENT" | "UNSPLASH") => {
    setTabShow(tab);
  };

  const onRef = useCallback((node) => {
    globalState.set("image_options_ref", node);
  }, []);

  return (
    <>
      <UnsplashSty.Wrapper>
        <UnsplashSty.Title>
          <UnsplashSty.TabOptions>
            <UnsplashSty.Tab
              active={tabShow === "GRADIENT"}
              onClick={() => handleClick("GRADIENT")}
            >
              {translateThis("GRADIENT")}
            </UnsplashSty.Tab>
            <UnsplashSty.Tab
              active={tabShow === "UNSPLASH"}
              onClick={() => handleClick("UNSPLASH")}
            >
              Unsplash
            </UnsplashSty.Tab>
          </UnsplashSty.TabOptions>

          <Space.Modifiers>
            {/* @ts-expect-error - gtdesign gotta fix it */}
            <Space.Modifiers mr="1rem" ref={onRef}></Space.Modifiers>
            <X
              cursor="pointer"
              size={15}
              onClick={() => stateStorage.set("show_img", false)}
            />
          </Space.Modifiers>
        </UnsplashSty.Title>
        {
          {
            GRADIENT: <Gradient />,
            UNSPLASH: <Unsplash />,
          }[tabShow]
        }
      </UnsplashSty.Wrapper>
      <UnsplashSty.Modal onClick={() => stateStorage.set("show_img", false)} />
    </>
  );
}

export default ImageOptions;

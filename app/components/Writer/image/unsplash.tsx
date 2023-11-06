import React, { useCallback, useEffect, useState } from "react";
import { UnsplashSty } from "./style";
import apiUnsplash from "../../../Axios/apiUnsplash";
import { ex } from "./example";
import { stateStorage } from "react-trigger-state";

function Unsplash() {
  const [images, setImages] = useState(ex);

  useEffect(() => {
    // gets 5 imgs from unsplash that can be used as a background
    // dimensions: 1920x1080
    apiUnsplash
      .get("/photos/random?count=6 &orientation=landscape&query=wallpaper")
      .then((res) => {
        setImages(res.data);
      });
  }, []);

  const handleClick = useCallback((img) => {
    stateStorage.set("img", img.urls.full);
  }, []);

  return (
    <>
      <UnsplashSty.Wrapper>
        <UnsplashSty.Container>
          {images.map((img) => (
            <UnsplashSty.ImgWrapper
              onClick={() => handleClick(img)}
              key={img.id}
            >
              <UnsplashSty.Img src={img.urls.regular} alt={img.description} />
              <UnsplashSty.Author href={img.user.links.html} target="_blank">
                {img.user.name}
              </UnsplashSty.Author>
            </UnsplashSty.ImgWrapper>
          ))}
        </UnsplashSty.Container>
      </UnsplashSty.Wrapper>
      <UnsplashSty.Modal />
    </>
  );
}

export default Unsplash;

import React, { useCallback, useEffect, useRef, useState } from "react";
import { UnsplashSty } from "./style";
import apiUnsplash from "../../../Axios/apiUnsplash";
import { stateStorage } from "react-trigger-state";
import { X } from "react-feather";
import { Loader, Space, Text, useGTTranslate } from "@geavila/gt-design";

function Unsplash() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // gets 6 imgs from unsplash that can be used as a background
    apiUnsplash
      .get("/photos/random?count=6 &orientation=landscape&query=wallpaper")
      .then((res) => {
        setImages(res.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleClick = useCallback((img) => {
    stateStorage.set("img", img.urls.full);
    stateStorage.set("show_img", false);
  }, []);

  const { translateThis } = useGTTranslate();

  const controller = useRef<AbortController & { signal: AbortSignal | null }>();

  const callApi = useCallback(async (value: string) => {
    try {
      controller.current?.abort?.();
      controller.current = new AbortController();

      await apiUnsplash
        .get(`/search/photos?query=${value}&per_page=6&orientation=landscape`, {
          signal: controller.current.signal,
        })
        .then((res) => {
          setImages(res.data.results);
        });

      setLoading(false);
    } catch (err) {
      if (err.name === "AbortError") return;
    }
  }, []);

  // only searches after 3sec of not typing
  const handleSearch = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.currentTarget.value;

      setLoading(true);

      callApi(value);
    },
    [callApi]
  );

  return (
    <>
      <UnsplashSty.Wrapper>
        <UnsplashSty.Title>
          <h3>Unsplash</h3>
          <X
            cursor="pointer"
            size={15}
            onClick={() => stateStorage.set("show_img", false)}
          />
        </UnsplashSty.Title>
        <UnsplashSty.Input
          onChange={handleSearch}
          placeholder={translateThis("SEARCH")}
        />
        <UnsplashSty.Container>
          {images.length === 0 && !loading && (
            <Text.P>{translateThis("NO_RESULTS")}</Text.P>
          )}
          {loading ? (
            <Space.Center>
              <Loader.Simple />
            </Space.Center>
          ) : (
            images.map((img) => (
              <UnsplashSty.ImgWrapper
                onClick={() => handleClick(img)}
                key={img.id}
              >
                <UnsplashSty.Img src={img.urls.regular} alt={img.description} />
                <UnsplashSty.Author href={img.user.links.html} target="_blank">
                  {img.user.name}
                </UnsplashSty.Author>
              </UnsplashSty.ImgWrapper>
            ))
          )}
        </UnsplashSty.Container>
      </UnsplashSty.Wrapper>
      <UnsplashSty.Modal onClick={() => stateStorage.set("show_img", false)} />
    </>
  );
}

export default Unsplash;

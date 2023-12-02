import { Loader, Space, Text, useGTTranslate } from "@geavila/gt-design";
import React, { useCallback, useEffect, useRef } from "react";
import { stateStorage, useTriggerState } from "react-trigger-state";
import apiUnsplash from "../../../Axios/apiUnsplash";
import { UnsplashSty } from "./style";
import { useContextName } from "../context/WriterContext";

function Unsplash() {
  const controller = useRef<AbortController & { signal: AbortSignal | null }>();
  const [images, setImages] = useTriggerState({
    name: "images_unsplash",
    initial: [],
  });
  const [loading, setLoading] = useTriggerState({
    name: "loading_background",
    initial: true,
  });
  const { translateThis } = useGTTranslate();

  useEffect(() => {
    if (!loading) return;

    // gets 6 imgs from unsplash that can be used as a background
    apiUnsplash
      .get("/photos/random?count=6 &orientation=landscape&query=wallpaper")
      .then((res) => {
        setImages(res.data);
      })
      .finally(() => setLoading(false));
  }, [loading, setImages, setLoading]);

  const contextName = useContextName();

  const handleClick = useCallback(
    (img) => {
      stateStorage.set(`${contextName}_img`, img.urls.full);
      stateStorage.set("show_img", false);
    },
    [contextName]
  );

  const callApi = useCallback(
    async (value: string) => {
      try {
        controller.current?.abort?.();
        controller.current = new AbortController();

        await apiUnsplash
          .get(
            `/search/photos?query=${value}&per_page=6&orientation=landscape`,
            {
              signal: controller.current.signal,
            }
          )
          .then((res) => {
            setImages(res.data.results);
          });

        setLoading(false);
      } catch (err) {
        if (err.name === "AbortError") return;
      }
    },
    [setImages, setLoading]
  );

  // only searches after 3sec of not typing
  const handleSearch = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.currentTarget.value;

      setLoading(true);

      callApi(value);
    },
    [callApi, setLoading]
  );

  return (
    <>
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
    </>
  );
}

export default Unsplash;

import { Button, Text, useGTTranslate } from "@geavila/gt-design";
import EmojiPicker from "emoji-picker-react";
import {
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  globalState,
  stateStorage,
  useTriggerState,
} from "react-trigger-state";
import ImageOptions from "./imageOptions";
import WritterImg from "./style";
import { useContextName } from "../context/WriterContext";

function Image() {
  const { translateThis } = useGTTranslate();
  const contextName = useContextName();
  const [emoji] = useTriggerState({
    name: `${contextName}_emoji`,
    initial: "",
  });
  const [showEmoji, setShowEmoji] = useTriggerState({
    name: "show_emoji",
    initial: false,
  });
  const [title, setTitle] = useTriggerState({
    name: `${contextName}_title`,
    initial: "",
  });

  const [imageRange, setImageRange] = useTriggerState({
    name: `${contextName}_image_range`,
    initial: 0,
  });

  const [showChangePosition] = useTriggerState({
    name: "show_change_position",
    initial: false,
  });
  const imgRef = useRef<HTMLImageElement>(null);
  const ref = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  const onTitleRef = useCallback((e: HTMLHeadingElement) => {
    globalState.set("title_ref", e);
    titleRef.current = e;
  }, []);

  const handleClick = useCallback(() => {
    setShowEmoji((prev) => !prev);
  }, [setShowEmoji]);

  useEffect(() => {
    // sets the title of the page
    document.title = `${emoji} ${title || translateThis("LEGERE.UNTITLED")}`;
  }, [title, emoji, translateThis]);

  const handleTitle = useCallback(
    (e: React.KeyboardEvent<HTMLHeadingElement>) => {
      const currPos = window.getSelection()?.anchorOffset || 0;
      globalState.set("curr_pos", currPos);

      setTitle(e.currentTarget.textContent || "");
    },
    [setTitle]
  );

  useLayoutEffect(() => {
    const avoid = globalState.get("avoid-title-pos");
    if (avoid) {
      globalState.set("avoid-title-pos", false);
      return;
    }

    const currPos = globalState.get("curr_pos");

    // set the cursor to the end of the text
    const range = document.createRange();
    const sel = window.getSelection();
    if (!sel) return;
    const node = titleRef.current?.childNodes[0];
    if (!node) return;

    range.setStart(node, currPos);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
  }, [title]);

  const [showBtn, setShowBtn] = useState(false);

  const [showImg] = useTriggerState({
    name: "show_img",
    initial: false,
  });

  const [img] = useTriggerState({
    name: `${contextName}_img`,
    initial: "",
  });

  useEffect(() => {
    setShowBtn(false);
  }, [showImg]);

  const setRange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setImageRange(Number(e.currentTarget.value));
    },
    [setImageRange]
  );

  useEffect(() => {
    // sets the object position
    imgRef.current?.style.setProperty(
      "object-position",
      `center ${imageRange}%`
    );
  }, [imageRange]);

  return (
    <>
      <WritterImg.Wrapper
        onMouseEnter={() => setShowBtn(true)}
        onMouseLeave={() => setShowBtn(false)}
      >
        {img?.top ? (
          <WritterImg.Gradient
            ref={imgRef}
            style={{
              background: `linear-gradient(${img.deg}deg, ${img.top} 0%, ${img.bottom} 100%)`,
            }}
          />
        ) : (
          <WritterImg.Image ref={imgRef} src={img} />
        )}
        <WritterImg.Title>
          <WritterImg.Emoji ref={ref} role="button" onClick={handleClick}>
            {emoji}
          </WritterImg.Emoji>
          <WritterImg.H1
            aria-placeholder={translateThis("LEGERE.UNTITLED")}
            ref={onTitleRef}
            onKeyUp={handleTitle}
            contentEditable
            suppressContentEditableWarning
          >
            {title}
          </WritterImg.H1>
        </WritterImg.Title>

        <ChangeImg show={showBtn && !showImg} />

        {showImg && <ImageOptions />}

        {showChangePosition && (
          <WritterImg.Range>
            <Text.P>
              {translateThis("IMG_RANGE_POSITION")} ({imageRange}%)
            </Text.P>
            <input type="range" value={imageRange} onChange={setRange} />
          </WritterImg.Range>
        )}
      </WritterImg.Wrapper>
      {showEmoji && <Emoji parentRef={ref} />}
    </>
  );
}

const ChangeImg = memo(({ show }: { show: boolean }) => {
  const { translateThis } = useGTTranslate();
  const contextName = useContextName();

  const [showChangePosition, setShowChangePosition] = useTriggerState({
    name: "show_change_position",
    initial: false,
  });
  const [img] = useTriggerState({
    name: `${contextName}_img`,
  });

  const changePosition = useCallback(() => {
    setShowChangePosition((prev) => {
      const value = !prev;

      if (!value) {
        console.log("novo valor", value);
      }

      return value;
    });
  }, [setShowChangePosition]);

  return (
    <WritterImg.Change show={show}>
      <Button.Contrast
        defaultSize="sm"
        onClick={() => stateStorage.set("show_img", true)}
      >
        {translateThis("CHANGE_IMG")}
      </Button.Contrast>

      {!img?.top && (
        <Button.Contrast defaultSize="sm" fitContent onClick={changePosition}>
          {translateThis(
            showChangePosition ? "CHANGING_POSITION" : "CHANGE_POSITION"
          )}
        </Button.Contrast>
      )}
    </WritterImg.Change>
  );
});

ChangeImg.displayName = "ChangeImg";

const Emoji = memo(
  ({ parentRef }: { parentRef: React.RefObject<HTMLDivElement> }) => {
    const [currTheme] = useTriggerState({ name: "curr_theme" });
    const ref = useRef<HTMLDivElement>(null);
    const contextName = useContextName();

    useEffect(() => {
      const parentBounding = parentRef.current?.getBoundingClientRect();
      if (!parentBounding) return;
      if (!ref.current) return;

      ref.current.style.left = `${parentBounding.left}px`;
    }, [parentRef]);

    useEffect(() => {
      // when scroll or click outside
      const handleClickOutside = (e: MouseEvent) => {
        if (!ref.current) return;
        if (
          ref.current.contains(e.target as Node) ||
          parentRef.current?.contains(e.target as Node)
        )
          return;

        stateStorage.set("show_emoji", false);
      };

      const handleScroll = () => {
        stateStorage.set("show_emoji", false);
      };

      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("scroll", handleScroll);

      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("scroll", handleScroll);
      };
    }, [parentRef]);

    return (
      <WritterImg.EmojiPicker ref={ref}>
        <EmojiPicker
          onEmojiClick={(e) => {
            stateStorage.set(`${contextName}_emoji`, e.emoji);
          }}
          // @ts-expect-error - emoji-picker-react types are not up to date
          theme={currTheme === "theme" ? "light" : "dark"}
        />
      </WritterImg.EmojiPicker>
    );
  }
);

Emoji.displayName = "Emoji";

export default Image;

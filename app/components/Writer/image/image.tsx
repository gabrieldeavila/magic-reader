import EmojiPicker from "emoji-picker-react";
import { memo, useCallback, useEffect, useRef } from "react";
import { stateStorage, useTriggerState } from "react-trigger-state";
import WritterImg from "./style";

function Image() {
  const [emoji] = useTriggerState({
    name: "emoji",
    initial: "🤡",
  });
  const [showEmoji, setShowEmoji] = useTriggerState({
    name: "show_emoji",
    initial: false,
  });
  const [title, setTitle] = useTriggerState({
    name: "title",
    initial: "Some Title",
  });

  const ref = useRef<HTMLDivElement>(null);

  const handleClick = useCallback(() => {
    setShowEmoji((prev) => !prev);
  }, [setShowEmoji]);

  useEffect(() => {
    // sets the title of the page
    document.title = `${emoji} ${title}`;
  }, [title, emoji]);

  return (
    <>
      <WritterImg.Wrapper>
        <WritterImg.Image src="https://images.unsplash.com/photo-1607970669494-309137683be5?ixlib=rb-1.2.1&q=85&fm=jpg&crop=entropy&cs=srgb&w=3600" />
        <WritterImg.Title>
          <WritterImg.Emoji ref={ref} role="button" onClick={handleClick}>
            {emoji}
          </WritterImg.Emoji>
          <WritterImg.H1>{title}</WritterImg.H1>
        </WritterImg.Title>
      </WritterImg.Wrapper>
      {showEmoji && <Emoji parentRef={ref} />}
    </>
  );
}

const Emoji = memo(
  ({ parentRef }: { parentRef: React.RefObject<HTMLDivElement> }) => {
    const [currTheme] = useTriggerState({ name: "curr_theme" });
    const ref = useRef<HTMLDivElement>(null);

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
            stateStorage.set("emoji", e.emoji);
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

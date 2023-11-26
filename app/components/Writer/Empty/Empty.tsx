import { useGTTranslate } from "@geavila/gt-design";
import Logo from "../navbar/logo";
import { EmptySt } from "./style";

function Empty() {
  const { translateThis } = useGTTranslate();

  return (
    <EmptySt.Wrapper>
      <EmptySt.Content>
        <Logo width="20dvw" />
        <EmptySt.Tip.Wrapper>
          <EmptySt.Tip.Content>
            <EmptySt.Tip.Title>
              {translateThis("SCRIBERE.EMPTY_SCREEN.TIP.NEW_FILE.TITLE")}
            </EmptySt.Tip.Title>
            <EmptySt.Tip.Shortcut>
              <EmptySt.Tip.Key>Alt</EmptySt.Tip.Key>+
              <EmptySt.Tip.Key>N</EmptySt.Tip.Key>
            </EmptySt.Tip.Shortcut>
          </EmptySt.Tip.Content>

          <EmptySt.Tip.Content>
            <EmptySt.Tip.Title>
              {translateThis("SCRIBERE.EMPTY_SCREEN.TIP.FULL_SCREEN.TITLE")}
            </EmptySt.Tip.Title>
            <EmptySt.Tip.Shortcut>
              <EmptySt.Tip.Key>F11</EmptySt.Tip.Key>
            </EmptySt.Tip.Shortcut>
          </EmptySt.Tip.Content>
        </EmptySt.Tip.Wrapper>
      </EmptySt.Content>
    </EmptySt.Wrapper>
  );
}

export default Empty;

import Logo from "../navbar/logo";
import { EmptySt } from "./style";

function Empty() {
  return (
    <EmptySt.Wrapper>
      <EmptySt.Content>
        <Logo width="20dvw" />
      </EmptySt.Content>
    </EmptySt.Wrapper>
  );
}

export default Empty;

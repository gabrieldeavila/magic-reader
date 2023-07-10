import { GTBasic, Space } from "@geavila/gt-design";
import { I18nextProvider } from "react-i18next";
import { BrowserRouter } from "react-router-dom";
import Nav from "./Components/Nav/Nav";
import i18n from "./Components/Translate/Translate";
import RoutesWrapper from "./Routes";
import "./global.css";

function App() {
  return (
    <GTBasic>
      <BrowserRouter>
        <Nav />
        <Space.Main flexDirection="column">
          <RoutesWrapper />
          <I18nextProvider i18n={i18n} />
        </Space.Main>
      </BrowserRouter>
    </GTBasic>
  );
}

export default App;

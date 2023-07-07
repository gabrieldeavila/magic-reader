import { GTBasic } from "@geavila/gt-design";
import { BrowserRouter } from "react-router-dom";
import RoutesWrapper from "./Routes";
import { I18nextProvider } from "react-i18next";
import i18n from "./Components/Translate/Translate";
import "./global.css";

function App() {
  return (
    <GTBasic>
      <BrowserRouter>
        <RoutesWrapper />
        <I18nextProvider i18n={i18n} />
      </BrowserRouter>
    </GTBasic>
  );
}

export default App;

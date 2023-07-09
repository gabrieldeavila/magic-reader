import { GTBasic, GTNavbar } from "@geavila/gt-design";
import { BrowserRouter } from "react-router-dom";
import RoutesWrapper from "./Routes";
import { I18nextProvider } from "react-i18next";
import i18n from "./Components/Translate/Translate";
import "./global.css";
import Nav from "./Components/Nav/Nav";

function App() {
  return (
    <GTBasic>
      <BrowserRouter>
        <Nav />
        <RoutesWrapper />
        <I18nextProvider i18n={i18n} />
      </BrowserRouter>
    </GTBasic>
  );
}

export default App;

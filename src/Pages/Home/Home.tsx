import { Space, Text } from "@geavila/gt-design";
import DropPDF from "../../Components/Drop/DropPDF";
import useTranslate from "../../Components/Translate/useTranslate";

function Home() {
  const t = useTranslate();

  return (
    <Space.Main flexDirection="column">
      <Space.Center flexDirection="column" mb="3rem">
        <Text.Title>{t("TITLE")}</Text.Title>
        <Text.Subtitle>{t("SUBTITLE")}</Text.Subtitle>
      </Space.Center>

      <DropPDF />
    </Space.Main>
  );
}

export default Home;

import { useTranslation } from "react-i18next";

function useTranslate() {
  // @ts-expect-error - avoid error from not using i18nextProvider
  const { t } = useTranslation();

  return t;
}

export default useTranslate;

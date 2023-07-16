import { Kanit } from "next/font/google";
import { getDictionary } from "../../get-dictionary";
import GTWrapper from "./gtWrapper";
import StyledComponentsRegistry from "./registry";
import "../global.css"

const kanit = Kanit({
  weight: ["100", "200", "300", "400", "500", "600", "700", "900"],
  style: ["italic", "normal"],
  subsets: ["latin-ext"],
  display: "swap",
  variable: "--font-kanit",
});

export const metadata = {
  title: "Dissolutus",
  description: "Dissolutus",
};

export async function generateStaticParams() {
  return [{ lang: "en-US" }, { lang: "pt-BR" }];
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { lang: "en" | "pt-BR" };
}) {
  const dict = await getDictionary(params.lang);

  return (
    <StyledComponentsRegistry>
      <html lang={params.lang} className={kanit.className}>
        <body>
          <GTWrapper kanit={kanit} serverTranslation={dict} lang={params.lang}>
            {children}
          </GTWrapper>
        </body>
      </html>
    </StyledComponentsRegistry>
  );
}

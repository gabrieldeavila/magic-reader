import { useMemo } from "react";
import { useTriggerState } from "react-trigger-state";
import { useContextName } from "../context/WriterContext";
import { IKeys, IText } from "../interface";
import { STOC } from "./style";

const getText = (text: IText[]) => {
  return text?.reduce?.((acc, item) => {
    return acc + item.value;
  }, "");
};

function TOC() {
  const contextName = useContextName();
  const [content] = useTriggerState({ name: contextName });

  const headers = useMemo(() => {
    const temps = {
      h1: null,
      h2: null,
    };

    const tempHeader = content.reduce((acc, item) => {
      if (temps[item.type] !== null && item.type !== "h3") {
        temps[item.type] = item;

        const level = item.type.replace("h", "");
        // clear the lower levels
        for (let i = parseInt(level) + 1; i <= Object.keys(temps).length; i++) {
          temps[`h${i}`] = null;
        }
      }

      const lastH1 = acc.length - 1;
      const lastH2 =
        temps.h1 == null ? acc.length - 1 : acc[lastH1]?.inside?.length - 1;

      if (item.type === "h3") {
        if (temps.h1 == null && temps.h2 == null) {
          acc.push({
            id: item.id,
            text: getText(item.text),
            type: item.type,
          });

          return acc;
        }

        if (temps.h1 !== null && temps.h2 !== null) {
          const h3Text = getText(item.text);

          acc[lastH2].inside[lastH2].inside.push({
            id: item.id,
            type: item.type,
            text: h3Text,
          });

          return acc;
        }

        if (temps.h1 !== null && temps.h2 == null) {
          const h3Text = getText(item.text);

          if (!acc[lastH1]) {
            acc.push({
              id: temps.h1.id,
              type: temps.h1.type,
              inside: [],
            });
          }

          acc[lastH1].inside.push({
            id: item.id,
            type: item.type,
            text: h3Text,
          });

          return acc;
        }

        if (temps.h1 == null && temps.h2 !== null) {
          const h3Text = getText(item.text);

          if (!acc[lastH2]) {
            acc.push({
              id: temps.h2.id,
              type: temps.h2.type,
              inside: [],
            });
          }

          acc[lastH2].inside.push({
            id: item.id,
            type: item.type,
            text: h3Text,
          });

          return acc;
        }
      }

      if (item.type === "h2") {
        temps.h2 = item;

        if (temps.h1 == null) {
          acc.push({
            id: item.id,
            type: item.type,
            text: getText(item.text),
            inside: [],
          });

          return acc;
        }

        if (temps.h1 !== null) {
          const h2Text = getText(item.text);

          if (!acc[lastH1]) {
            acc.push({
              id: temps.h1.id,
              type: temps.h1.type,
              inside: [],
            });
          }

          acc[lastH1].inside.push({
            id: item.id,
            type: item.type,
            text: h2Text,
            inside: [],
          });

          return acc;
        }
      }

      if (item.type === "h1") {
        temps.h1 = item;

        acc.push({
          id: item.id,
          type: item.type,
          text: getText(item.text),
          inside: [],
        });

        return acc;
      }

      return acc;
    }, []);

    return tempHeader;
  }, [content]);

  if (headers.length === 0) return null;

  return (
    <STOC.Wrapper>
      <STOC.Container>
        {headers.map((header) => {
          return <TOCLink key={header.id} header={header} />;
        })}
      </STOC.Container>
    </STOC.Wrapper>
  );
}

export default TOC;

const TOCLink = ({ header }: { header: IKeys }) => {
  const href = useMemo(() => `#${header.id}`, [header.id]);

  const children = useMemo(() => {
    return header.inside?.length > 0
      ? header.inside.map((header) => {
          return <TOCLink key={header.id} header={header} />;
        })
      : null;
  }, [header.inside]);

  return (
    <STOC.List>
      <a href={href}>{header.text}</a>
      {children}
    </STOC.List>
  );
};

import { useGTTranslate } from "@geavila/gt-design";
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
  const { translateThis } = useGTTranslate();
  const contextName = useContextName();
  const [content] = useTriggerState({ name: contextName });

  const headers = useMemo(() => {
    /* returns something like 
      {"Header 1" : {
        id: "header-1",
        inside: {
          "Header 1.1": {
            id: "header-1-1",
            inside: {}
          }
        }
      }
      }
      */

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

      if (item.type === "h3") {
        if (temps.h1 == null && temps.h2 == null) {
          acc[getText(item.text)] = {
            id: item.id,
            type: item.type,
          };

          return acc;
        }

        if (temps.h1 !== null && temps.h2 !== null) {
          acc[getText(temps.h1.text)].inside[getText(temps.h2.text)].inside[
            getText(item.text)
          ] = {
            id: item.id,
            type: item.type,
          };

          return acc;
        }

        if (temps.h1 !== null && temps.h2 == null) {
          acc[getText(temps.h1.text)].inside[getText(item.text)] = {
            id: item.id,
            type: item.type,
          };

          return acc;
        }
      }

      if (item.type === "h2") {
        temps.h2 = item;

        if (temps.h1 == null) {
          acc[getText(item.text)] = {
            id: item.id,
            type: item.type,
            inside: {},
          };

          return acc;
        }

        if (temps.h1 !== null) {
          acc[getText(temps.h1.text)].inside[getText(item.text)] = {
            id: item.id,
            type: item.type,
            inside: {},
          };

          return acc;
        }
      }

      if (item.type === "h1") {
        temps.h1 = item;

        acc[getText(item.text)] = {
          id: item.id,
          type: item.type,
          inside: {},
        };

        return acc;
      }

      return acc;
    }, {});

    return tempHeader;
  }, [content]);

  return (
    <STOC.Wrapper>
      <STOC.Container>
        <STOC.Title>{translateThis("TOC")}</STOC.Title>

        {Object.entries(headers).map(([header, values]) => {
          // @ts-expect-error FIXME
          return <TOCLink key={values.id} header={header} values={values} />;
        })}
      </STOC.Container>
    </STOC.Wrapper>
  );
}

export default TOC;

const TOCLink = ({ header, values }: { header: string; values: IKeys }) => {
  const href = useMemo(() => `#${values.id}`, [values.id]);

  const children = useMemo(() => {
    return values.inside == null
      ? null
      : Object.entries(values.inside).map(([header, values]) => {
          // @ts-expect-error FIXME
          return <TOCLink key={values.id} header={header} values={values} />;
        });
  }, [values.inside]);

  return (
    <STOC.List>
      <a href={href}>{header}</a>
      {children}
    </STOC.List>
  );
};

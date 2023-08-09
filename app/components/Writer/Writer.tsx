import React from "react";
import { IWriter } from "./interface";

const OPTIONS = {
  p: React.lazy(() => import("./options/p/p")),
};

function Writer({ content }: IWriter) {
  return (
    <>
      {content.map((item) => {
        const Component = OPTIONS[item.type];

        return <Component {...item} />;
      })}
    </>
  );
}

export default Writer;

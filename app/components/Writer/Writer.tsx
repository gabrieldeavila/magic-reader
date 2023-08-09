import React from "react";
import { IWriter } from "./interface";

const OPTIONS = {
  p: React.lazy(() => import("./options/p/p")),
};

function Writer({ content }: IWriter) {
  return (
    <>
      {content.map((item, index) => {
        const Component = OPTIONS[item.type];

        return <Component {...item} position={index} />;
      })}
    </>
  );
}

export default Writer;

import React from "react";

function Page({ params: { id } }: { params: { id: string } }) {
  return <div>FAZUELI, {id}</div>;
}

export default Page;

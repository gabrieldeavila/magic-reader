"use client";

import { SectionContainer, Space } from "@geavila/gt-design";
import { useCallback } from "react";
import apiProject from "../../Axios/apiProject";
import Books from "../../components/Books/Books";
import DropPDF from "../../components/Drop/DropPDF";
import axios from "axios";

function page() {
  const handleClick = useCallback(async (formData: any) => {
    console.log(process.env.NEXT_PUBLIC_READER_URL);
    const { data } = await axios.post("/api/legere", formData);

    return data;
  }, []);

  return (
    <Space.Horizontal>
      <SectionContainer title="Dissolutus Legere" subtitle="LEGERE.START" />

      <DropPDF uploadFile={handleClick} />
      <Books />
    </Space.Horizontal>
  );
}

export default page;

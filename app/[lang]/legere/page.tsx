"use client";

import { SectionContainer, Space } from "@geavila/gt-design";
import { useCallback } from "react";
import Books from "../../components/Books/Books";
import DropPDF from "../../components/Drop/DropPDF";
import axios from "axios";

function page() {
  const handleClick = useCallback(async (formData: any) => {
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

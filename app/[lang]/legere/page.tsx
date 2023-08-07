"use client";

import { SectionContainer, Space } from "@geavila/gt-design";
import axios from "axios";
import { useCallback, useEffect } from "react";
import Books from "../../components/Books/Books";
import DropPDF from "../../components/Drop/DropPDF";

function page() {
  const handleClick = useCallback(async (formData: any) => {
    const { data } = await axios.post("/api/legere", formData);

    return data;
  }, []);

  useEffect(() => {
    axios.get("/api");
  }, []);

  return (
    // @ts-expect-error
    <Space.Horizontal mt="-1rem !important" px="1.5rem !important">
      <SectionContainer title="Dissolutus Legere" subtitle="LEGERE.START" />

      <DropPDF uploadFile={handleClick} />
      <Books />

    </Space.Horizontal>
  );
}

export default page;

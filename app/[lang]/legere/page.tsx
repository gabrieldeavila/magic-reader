"use client";

import { SectionContainer, Space } from "@geavila/gt-design";
import { useCallback } from "react";
import apiProject from "../../Axios/apiProject";
import Books from "../../components/Books/Books";
import DropPDF from "../../components/Drop/DropPDF";

function page() {
  const handleClick = useCallback(async (formData: any) => {
    const { data } = await apiProject.post("/api/legere", formData);

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

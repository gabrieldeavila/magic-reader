"use client";

import { SectionContainer, Space, Text } from "@geavila/gt-design";
import React from "react";
import DropPDF from "../../components/Drop/DropPDF";
import Books from "../../components/Books/Books";
import { ReaderModal } from "../../components/Reader/Reader";

function page() {
  return (
    <Space.Horizontal>
      <SectionContainer title="Dissolutus Legere" subtitle="LEGERE.START" />

      <DropPDF />

      <Books />
    </Space.Horizontal>
  );
}

export default page;

"use client";

import { Button, SectionContainer, Space, Text } from "@geavila/gt-design";
import { signOut } from "next-auth/react";
import React from "react";
import DropPDF from "../../components/Drop/DropPDF";

function page() {
  return (
    <Space.Horizontal>
      <SectionContainer title="Dissolutus Legere" subtitle="LEGERE.START" />

      <DropPDF />
    </Space.Horizontal>
  );
}

export default page;

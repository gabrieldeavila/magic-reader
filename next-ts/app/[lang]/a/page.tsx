"use client";

import { Button, SectionContainer, Space, Text } from "@geavila/gt-design";
import { signOut } from "next-auth/react";
import React from "react";
import DropPDF from "../components/Drop/DropPDF";

function page() {
  return (
    <Space.Horizontal>
      <SectionContainer title="WELCOME" subtitle="LOGGED_IN" />

      <DropPDF />
    </Space.Horizontal>
  );
}

export default page;

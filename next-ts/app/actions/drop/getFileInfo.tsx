"use server";

import apiReader from "../../Axios/apiReader";

export async function getFileInfo({ formData }) {
  return apiReader.post("/reader/pdf-to-array", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}

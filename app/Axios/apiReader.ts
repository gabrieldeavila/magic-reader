import axios from "axios";

const apiReader = axios.create({
  baseURL: process.env.NEXT_PUBLIC_READER_URL,
});

export default apiReader;

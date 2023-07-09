import axios from "axios";

const apiReader = axios.create({
  baseURL: process.env.REACT_APP_API_READER_URL,
});

export default apiReader;

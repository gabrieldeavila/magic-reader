import axios from "axios";

const apiProject = axios.create({
  baseURL: process.env.NEXT_PUBLIC_PROJECT_URL,
});

export default apiProject;

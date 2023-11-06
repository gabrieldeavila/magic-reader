import axios from "axios";

const apiUnsplash = axios.create({
  baseURL: "https://api.unsplash.com/",
  // add your unsplash access key here
  headers: {
    Authorization: "Client-ID " + process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY,
  },
});

export default apiUnsplash;

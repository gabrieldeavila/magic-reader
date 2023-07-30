import apiReader from "../Axios/apiReader";

export async function GET(request: Request) {
  return await apiReader.get("/");
}

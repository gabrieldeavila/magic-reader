import apiReader from "../Axios/apiReader";

export async function GET() {
  try {
    const { data } = await apiReader.post("/reader/pdf-to-array");
    console.log(data);
    return new Response(JSON.stringify("ok"), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response("ok", {
      headers: { "Content-Type": "application/json" },
      status: 200,
      statusText: "Internal Server Error",
    });
  }
}

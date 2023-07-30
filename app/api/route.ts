import apiReader from "../Axios/apiReader";

export async function GET(request: Request) {
  try {
    const { data } = await apiReader.get("/");

    return new Response(JSON.stringify("ok"), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify(e), {
      headers: { "Content-Type": "application/json" },
      status: 400,
      statusText: "Internal Server Error",
    });
  }

  return "ok";
}

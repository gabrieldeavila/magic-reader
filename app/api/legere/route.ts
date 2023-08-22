import apiReader from "../../Axios/apiReader";

export async function GET() {
  return new Response("Hello world!");
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    if (!formData) return new Response("No file found", { status: 400 });
    const { data } = await apiReader.post("/reader/pdf-to-array", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify(e), {
      headers: { "Content-Type": "application/json" },
      status: 500,
      statusText: "Internal Server Error",
    });
  }
}

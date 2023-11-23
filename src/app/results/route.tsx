"use server";

import { promises as fs } from "fs";

export async function GET() {
  const file = await fs.readFile("./src/app/results.json", "utf8");
  const fileContents = await JSON.parse(file);

  return new Response(JSON.stringify(fileContents));
}

export async function POST(req: Request) {
  const body = await req.text();
  const authToken = req.headers.get("writeKey")?.split("Bearer ")[1];

  if (authToken == process.env.NEXT_PUBLIC_POST_KEY) {
    try {
      const file = await fs.writeFile("./src/app/results.json", body, "utf8");

      return new Response(JSON.stringify({ ok: 200 }));
    } catch (err) {
      return new Response(JSON.stringify({ error: 204, message: err }));
    }
  } else {
    return new Response(JSON.stringify({ error: 404 }));
  }
}

import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST() {
  const token = crypto.randomBytes(16).toString("hex");
  // Token stored in Redis via FastAPI, not in-memory
  return NextResponse.json({ token });
}

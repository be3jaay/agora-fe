import { NextResponse } from "next/server";

export async function GET() {
  const appId   = process.env.NEXT_AGORA_APP_ID;
  const channel = process.env.NEXT_AGORA_APP_CHANNEL;
  const token   = process.env.NEXT_AGORA_APP_TOKEN ?? null;

  if (!appId || !channel) {
    return NextResponse.json(
      { error: "Agora credentials not configured." },
      { status: 500 }
    );
  }

  return NextResponse.json({ appId, channel, token });
}

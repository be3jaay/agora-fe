import { NextResponse } from "next/server";

/**
 * Bridges the FE to the SukiCloser backend.
 *
 * The buyer/host Agora live hook calls this route to get { appId,
 * channel, token }. We mint a fresh RTC token on the backend so the
 * App Certificate never leaks into client code.
 *
 * Backend URL is configurable via SUKICLOSER_BACKEND_URL (server-side
 * env) — defaults to http://localhost:3000.
 */

const BACKEND_URL =
  process.env.SUKICLOSER_BACKEND_URL ?? "http://localhost:3000";

const CHANNEL =
  process.env.NEXT_AGORA_APP_CHANNEL ??
  process.env.NEXT_PUBLIC_AGORA_CHANNEL ??
  "sukicloser-demo";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    // uid=0 mints an "any-uid" token so the FE can call
    // client.join(appId, channel, token, 0) and let Agora assign a uid.
    // Pass an explicit uid (?uid=…) only when you need a token bound
    // to a specific identity (e.g. the agent's reserved uid).
    const uid = url.searchParams.get("uid") ?? "0";
    const channelName = url.searchParams.get("channel") ?? CHANNEL;

    const tokenRes = await fetch(`${BACKEND_URL}/api/tokens/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channelName, uid }),
      cache: "no-store",
    });

    if (!tokenRes.ok) {
      const errBody = await tokenRes.text();
      return NextResponse.json(
        {
          error: `Backend token mint failed (${tokenRes.status}): ${errBody}`,
        },
        { status: 502 }
      );
    }

    const { rtcToken, rtmToken, appId } = (await tokenRes.json()) as {
      rtcToken: string;
      rtmToken: string;
      appId: string;
    };

    return NextResponse.json({
      appId,
      channel: channelName,
      token: rtcToken,
      rtmToken,
      uid,
    });
  } catch (err) {
    return NextResponse.json(
      {
        error: `Could not reach backend at ${BACKEND_URL}: ${
          err instanceof Error ? err.message : String(err)
        }`,
      },
      { status: 502 }
    );
  }
}

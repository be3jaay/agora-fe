"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type {
  IAgoraRTCClient,
  ICameraVideoTrack,
  IMicrophoneAudioTrack,
  IRemoteVideoTrack,
  IAgoraRTCRemoteUser,
  UID,
} from "agora-rtc-sdk-ng";

export type LiveRole = "host" | "audience";

export type ConnectionState =
  | "idle"
  | "fetching"
  | "connecting"
  | "live"
  | "error";

export interface AgoraLiveState {
  state:         ConnectionState;
  error:         string | null;
  role:          LiveRole;
  viewerCount:   number;
  isMicMuted:    boolean;
  isCamOff:      boolean;
  localVideo:    ICameraVideoTrack | null;
  remoteVideo:   IRemoteVideoTrack | null;
  join:          (role: LiveRole) => Promise<void>;
  leave:         () => Promise<void>;
  toggleMic:     () => Promise<void>;
  toggleCamera:  () => Promise<void>;
}

export function useAgoraLive(): AgoraLiveState {
  const clientRef = useRef<IAgoraRTCClient | null>(null);
  const localVideoRef  = useRef<ICameraVideoTrack | null>(null);
  const localAudioRef  = useRef<IMicrophoneAudioTrack | null>(null);

  const [state,       setState]       = useState<ConnectionState>("idle");
  const [error,       setError]       = useState<string | null>(null);
  const [role,        setRole]        = useState<LiveRole>("audience");
  const [viewerCount, setViewerCount] = useState(0);
  const [isMicMuted,  setMicMuted]    = useState(false);
  const [isCamOff,    setCamOff]      = useState(false);
  const [localVideo,  setLocalVideo]  = useState<ICameraVideoTrack | null>(null);
  const [remoteVideo, setRemoteVideo] = useState<IRemoteVideoTrack | null>(null);

  useEffect(() => {
    return () => {
      void cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function cleanup() {
    try {
      localVideoRef.current?.stop();
      localVideoRef.current?.close();
      localAudioRef.current?.stop();
      localAudioRef.current?.close();
      await clientRef.current?.leave();
    } catch {
      // ignore cleanup errors
    }
    clientRef.current     = null;
    localVideoRef.current = null;
    localAudioRef.current = null;
    setLocalVideo(null);
    setRemoteVideo(null);
    setViewerCount(0);
  }

  const join = useCallback(async (joinRole: LiveRole) => {
    try {
      setState("fetching");
      setError(null);
      setRole(joinRole);

      const res = await fetch("/api/agora/config");
      if (!res.ok) throw new Error("Could not load Agora credentials.");
      const { appId, channel, token } = (await res.json()) as {
        appId: string;
        channel: string;
        token: string | null;
      };

      setState("connecting");

      const AgoraRTC = (await import("agora-rtc-sdk-ng")).default;
      AgoraRTC.setLogLevel(2); 

      const client = AgoraRTC.createClient({
        mode: "live",
        codec: "vp8",
      });
      clientRef.current = client;

      await client.setClientRole(joinRole === "host" ? "host" : "audience",
        joinRole === "audience" ? { level: 1 } : undefined
      );

      client.on("user-joined",    () => setViewerCount(n => n + 1));
      client.on("user-left",      () => setViewerCount(n => Math.max(0, n - 1)));

      client.on("user-published", async (user: IAgoraRTCRemoteUser, mediaType: "audio" | "video") => {
        await client.subscribe(user, mediaType);
        if (mediaType === "video") {
          setRemoteVideo(user.videoTrack ?? null);
        }
        if (mediaType === "audio") {
          user.audioTrack?.play();
        }
      });
      client.on("user-unpublished", (user: IAgoraRTCRemoteUser, mediaType: "audio" | "video") => {
        if (mediaType === "video") setRemoteVideo(null);
      });

      const uid: UID = await client.join(appId, channel, token, 0);
      console.info(`[XStream] Joined channel as ${joinRole}, uid=${uid}`);

      if (joinRole === "host") {
        const [micTrack, camTrack] = await AgoraRTC.createMicrophoneAndCameraTracks(
          { AEC: true, ANS: true },
          { encoderConfig: "720p_2" }
        );
        localAudioRef.current = micTrack;
        localVideoRef.current = camTrack;

        await client.publish([micTrack, camTrack]);
        setLocalVideo(camTrack);
      }

      setViewerCount(client.remoteUsers.length);

      setState("live");
    } catch (err: unknown) {
      console.error("[XStream] Agora join error:", err);
      setError(err instanceof Error ? err.message : "Failed to connect.");
      setState("error");
      await cleanup();
    }
  }, []);

  const leave = useCallback(async () => {
    setState("idle");
    await cleanup();
  }, []);

  const toggleMic = useCallback(async () => {
    if (!localAudioRef.current) return;
    if (isMicMuted) {
      await localAudioRef.current.setMuted(false);
      setMicMuted(false);
    } else {
      await localAudioRef.current.setMuted(true);
      setMicMuted(true);
    }
  }, [isMicMuted]);

  const toggleCamera = useCallback(async () => {
    if (!localVideoRef.current) return;
    if (isCamOff) {
      await localVideoRef.current.setMuted(false);
      setCamOff(false);
    } else {
      await localVideoRef.current.setMuted(true);
      setCamOff(true);
    }
  }, [isCamOff]);

  return {
    state,
    error,
    role,
    viewerCount,
    isMicMuted,
    isCamOff,
    localVideo,
    remoteVideo,
    join,
    leave,
    toggleMic,
    toggleCamera,
  };
}

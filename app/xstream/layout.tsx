import "./xstream.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "XStream — AI Livestream Commerce",
  description: "Realtime AI sales agents for conversational commerce. One livestream, thousands of simultaneous AI conversations.",
};

export default function XStreamLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden" }}>
      {children}
    </div>
  );
}

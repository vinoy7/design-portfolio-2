"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// ponytail: dynamic+ssr:false so the canvas/physics bundle is excluded from the desktop bundle
const MobilePortfolioPage = dynamic(
  () => import("./mobile/MobilePortfolioPage"),
  { ssr: false, loading: () => null }
);

type Device = "mobile" | "tablet" | "desktop";

// mobile < 768 <= tablet < 1280 <= desktop (portfolio needs the wide canvas)
function getDevice(): Device {
  const w = window.innerWidth;
  if (w < 768) return "mobile";
  if (w < 1280) return "tablet";
  return "desktop";
}

function MessageScreen({ variant }: { variant: "mobile" | "tablet" }) {
  const isMobile = variant === "mobile";
  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#fff",
        padding: "24px",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "48px",
          width: isMobile ? "290px" : "347px",
          maxWidth: "100%",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/icons/Logo.svg" alt="Vinoy Varghese" width={64} height={64} />
        <p
          style={{
            fontFamily: "var(--font-dm-sans)",
            fontWeight: 400,
            fontSize: isMobile ? "18px" : "20px",
            lineHeight: "26px",
            letterSpacing: isMobile ? "-0.18px" : "-0.2px",
            color: "#757575",
            textAlign: "center",
            margin: 0,
          }}
        >
          Vinoy&rsquo;s Design Portfolio is best experienced on desktop/laptop.
          <br />
          <br />
          {isMobile ? "Mobile" : "Tablet"} version is being developed as you are
          reading this message.
        </p>
      </div>
    </div>
  );
}

export default function DeviceGate({ children }: { children: React.ReactNode }) {
  const [device, setDevice] = useState<Device | null>(null);

  useEffect(() => {
    const update = () => setDevice(getDevice());
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // null until mounted -> avoids hydration mismatch and wrong-screen flash
  if (device === null) return null;
  if (device === "mobile") return <MobilePortfolioPage />;
  if (device === "tablet") return <MessageScreen variant="tablet" />;
  return <>{children}</>;
}

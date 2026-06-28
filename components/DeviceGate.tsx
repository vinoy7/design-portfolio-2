"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// ponytail: dynamic+ssr:false so the canvas/physics bundle is excluded from the desktop bundle
const MobilePortfolioPage = dynamic(
  () => import("./mobile/MobilePortfolioPage"),
  { ssr: false, loading: () => null }
);

const TabletPortfolioPage = dynamic(
  () => import("./tablet/TabletPortfolioPage"),
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
  if (device === "tablet") return <TabletPortfolioPage />;
  return <>{children}</>;
}

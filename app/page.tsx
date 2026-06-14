import PortfolioPage from "@/components/PortfolioPage";
import DeviceGate from "@/components/DeviceGate";

export default function Home() {
  return (
    <DeviceGate>
      <PortfolioPage />
    </DeviceGate>
  );
}

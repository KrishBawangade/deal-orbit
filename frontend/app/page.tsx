import Navbar from "@/components/Navbar";
import OrbitalBackground from "@/components/OrbitalBackground";
import HeroDealOrbit from "@/components/HeroDealOrbit";
import PositioningStrip from "@/components/PositioningStrip";
import DualSidedSimulator from "@/components/DualSidedSimulator";
import OperationsGovernance from "@/components/OperationsGovernance";
import OrbitSignatureSection from "@/components/OrbitSignatureSection";
import ExecutiveMetrics from "@/components/ExecutiveMetrics";
import FinalCtaAndFooter from "@/components/FinalCtaAndFooter";

export default async function Home() {
  return (
    <div className="min-h-screen flex flex-col relative text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      {/* 1. PRD Subtle Animated Orbital Background */}
      <OrbitalBackground />

      {/* 2. Global Navigation */}
      <Navbar />

      <main className="flex-1 w-full relative z-10">
        {/* 3. Hero Section: Live Deal at the Center with Sensitive Internal Telemetry */}
        <HeroDealOrbit />

        {/* 4. Positioning: The 7 Operational Forces around the Deal */}
        <PositioningStrip />

        {/* 5. Signature Decision Simulator: Scenarios A, B, C with Sensitive Margins & COGS */}
        <DualSidedSimulator />

        {/* 6. Operations & Governance: Re-Routing, Multi-Warehouse Feasibility, Hybrid Billing */}
        <OperationsGovernance />

        {/* 7. Orbit Signature Visual Architecture: 9 Interactive Forces on Concentric Tracks */}
        <OrbitSignatureSection />

        {/* 8. Executive Pipeline Telemetry & RevOps Metrics */}
        <ExecutiveMetrics />
      </main>

      {/* 9. Final CTA & Enterprise Footer */}
      <FinalCtaAndFooter />
    </div>
  );
}

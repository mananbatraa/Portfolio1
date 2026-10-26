"use client";

import dynamic from "next/dynamic";

// WebGL only runs in the browser, so the stage skips server rendering.
const LaptopStage = dynamic(() => import("@/components/LaptopStage"), {
  ssr: false,
  loading: () => <div className="fixed inset-0 z-0 bg-ground" aria-hidden />,
});

export default LaptopStageLoader;

function LaptopStageLoader() {
  return <LaptopStage />;
}

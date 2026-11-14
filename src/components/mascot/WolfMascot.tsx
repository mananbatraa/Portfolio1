"use client";

import dynamic from "next/dynamic";

// WebGL only runs in the browser, so the wolf skips server rendering.
const WolfMascot = dynamic(() => import("@/components/mascot/WolfStage"), { ssr: false });

export default WolfMascot;

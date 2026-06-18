"use client";

import React from "react";
import MathLibrary from "@/components/templates/MathLibrary/MathLibrary";

type MathLibraryClientProps = {
  initialAssets?: any[];
  initialYear?: number;
};

export default function MathLibraryClient({
  initialAssets = [],
  initialYear = 1,
}: MathLibraryClientProps) {
  return (
    <MathLibrary
      initialAssets={initialAssets as any}
      initialYear={initialYear}
    />
  );
}

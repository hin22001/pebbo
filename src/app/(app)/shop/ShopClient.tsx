"use client";

import React from "react";
import Shop from "@/app/components/templates/Shop/Shop";

type ShopItemsByTab = {
  boosters: any[];
  puzzle: any[];
  custom: any[];
};

type ShopClientProps = {
  initialItems?: ShopItemsByTab | null;
};

export default function ShopClient({
  initialItems = null,
}: ShopClientProps) {
  return <Shop initialItems={initialItems ?? undefined} />;
}


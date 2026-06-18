import ShopClient from "./ShopClient";

export const metadata = {
  title: "Pebbo Shop — Customization & Boosters",
  description:
    "Exchange your hard-earned coins for boosters and customize your Pebbo experience. AI math learning for ages 6–12.",
  openGraph: {
    title: "Pebbo Shop — Customization & Boosters",
    description: "Exchange coins for boosters and customize your Pebbo experience.",
    siteName: "Pebbo",
  },
};

export default async function ShopPage() {
  // TODO: Replace with real API when /api/protected/student/shop/getItems exists
  const initialItems: { boosters: any[]; puzzle: any[]; custom: any[] } | null =
    null;

  return <ShopClient initialItems={initialItems} />;
}


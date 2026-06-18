import LeaderboardClient from "./LeaderboardClient";
import { Supabase } from "@/src/app/api/lib/models/supabase";

export const metadata = {
  title: "Leaderboard — Pebbo",
  description:
    "View the Pebbo student leaderboard. See weekly math champions, XP rankings, and levels. Compete for top spots in AI-powered maths practice.",
  openGraph: {
    title: "Leaderboard — Pebbo",
    description: "Weekly math champions and rankings for ages 6–12.",
    siteName: "Pebbo",
  },
};

export default async function LeaderboardPage() {
  const TOP_N = 20;
  const supabase = new Supabase();
  const serviceClient = supabase.getServiceClient();

  // We map metrics -> the existing UI's `xp / level / league` fields.
  const coinsToXp = (coins: number) => Math.round(coins * 2.5);
  const xpToLevel = (xp: number) => Math.floor(xp / 100);
  const rankToLeague = (rank: number) => {
    if (rank <= 5) return "Gold League";
    if (rank <= 10) return "Silver League";
    return "Bronze League";
  };

  const userLabel = (u: any) => {
    const first = String(u?.first_name ?? "").trim();
    const last = String(u?.last_name ?? "").trim();
    const full = `${first} ${last}`.trim();
    return full || String(u?.user_id ?? "Unknown User");
  };

  // Overall leaderboard by coins.
  let initialCoinsLeaderboard: any[] = [];
  try {
    const { data: coinRows } = await serviceClient
      .from("user_coins")
      .select("user_id,total_coins")
      .order("total_coins", { ascending: false })
      .limit(100);

    const filtered = (coinRows ?? [])
      .filter((r: any) => r?.user_id && r?.total_coins != null)
      .slice(0, TOP_N);

    const userIds = Array.from(new Set(filtered.map((r: any) => r.user_id)));
    const { data: users } = userIds.length
      ? await serviceClient
          .from("users")
          .select("user_id,first_name,last_name,role")
          .in("user_id", userIds)
      : { data: [] as any[] };

    const userById = new Map(
      (users ?? []).map((u: any) => [u.user_id, u] as const),
    );

    const entries = filtered
      .map((r: any, idx: number) => {
        const u = userById.get(r.user_id);
        // Only show students; skip teachers/teachers etc.
        if (!u || u.role !== "student") return null;

        const coins = Number(r.total_coins ?? 0);
        const xp = coinsToXp(coins);
        const rank = idx + 1;

        return {
          id: rank,
          rank,
          name: userLabel(u),
          coins,
          xp,
          level: xpToLevel(xp),
          league: rankToLeague(rank),
          avatar: rank % 2 === 0 ? "bobby" : "potter",
        };
      })
      .filter(Boolean);

    initialCoinsLeaderboard = entries as any[];
  } catch (e) {
    console.warn("leaderboard: coins fetch failed:", e);
    initialCoinsLeaderboard = [];
  }

  // Placement test leaderboard by latest placement score.
  let initialPlacementLeaderboard: any[] = [];
  try {
    const PAGE_SIZE = 1000;
    let from = 0;
    const latestByUser = new Map<
      string,
      { id: number; user_id: string; score: number; total_questions: number }
    >();

    while (latestByUser.size < TOP_N) {
      const to = from + PAGE_SIZE - 1;
      const { data: placementRows, error } = await serviceClient
        .from("placement_test_results")
        .select("id,user_id,score,total_questions")
        .order("id", { ascending: false })
        .range(from, to);

      if (error) throw error;

      const rows = (placementRows ?? []) as any[];
      for (const row of rows) {
        if (!row?.user_id) continue;
        const score = Number(row.score);
        const total = Number(row.total_questions);
        if (!Number.isFinite(score) || !Number.isFinite(total) || total <= 0) continue;

        const key = String(row.user_id);
        if (!latestByUser.has(key)) {
          latestByUser.set(key, {
            id: Number(row.id),
            user_id: key,
            score,
            total_questions: total,
          });
        }
      }

      if ((rows ?? []).length < PAGE_SIZE) break;
      from += PAGE_SIZE;
    }

    const placementArr = Array.from(latestByUser.values()).filter(
      (x) => x.user_id && x.total_questions > 0,
    );

    const placementsSorted = placementArr
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        if (b.total_questions !== a.total_questions) return b.total_questions - a.total_questions;
        return b.id - a.id;
      })
      .slice(0, TOP_N);

    const userIds = placementsSorted.map((p) => p.user_id);
    const { data: users } = userIds.length
      ? await serviceClient
          .from("users")
          .select("user_id,first_name,last_name,role")
          .in("user_id", userIds)
      : { data: [] as any[] };

    const { data: coinRows } = userIds.length
      ? await serviceClient
          .from("user_coins")
          .select("user_id,total_coins")
          .in("user_id", userIds)
      : { data: [] as any[] };

    const userById = new Map(
      (users ?? []).map((u: any) => [u.user_id, u] as const),
    );
    const coinsByUserId = new Map(
      (coinRows ?? []).map((r: any) => [String(r.user_id), Number(r.total_coins ?? 0)] as const),
    );

    const entries = placementsSorted
      .map((p, idx) => {
        const u = userById.get(p.user_id);
        if (!u || u.role !== "student") return null;

        const pct = (p.score / p.total_questions) * 100;
        const xp = Math.round((pct / 100) * 2845);
        const coins = Number(coinsByUserId.get(p.user_id) ?? 0);
        const rank = idx + 1;

        return {
          id: rank,
          rank,
          name: userLabel(u),
          coins,
          xp,
          level: xpToLevel(xp),
          league: rankToLeague(rank),
          avatar: rank % 2 === 0 ? "bobby" : "potter",
        };
      })
      .filter(Boolean);

    initialPlacementLeaderboard = entries as any[];
  } catch (e) {
    console.warn("leaderboard: placement fetch failed:", e);
    initialPlacementLeaderboard = [];
  }

  return (
    <LeaderboardClient
      initialCoinsLeaderboard={initialCoinsLeaderboard}
      initialPlacementLeaderboard={initialPlacementLeaderboard}
    />
  );
}

"use client";

import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { assignMainLayout } from "@/app/contexts/redux/actions";
import { StudentCard } from "@/src/app/components";
import { Box, Stack, Tab, Tabs } from "@mui/material";
import { LeaderboardPage } from "@/components/templates";

type LeaderboardEntry = {
  id: number;
  rank: number;
  name: string;
  coins?: number;
  xp: number;
  level: number;
  league: string;
  avatar: string;
};

type LeaderboardClientProps = {
  initialCoinsLeaderboard?: LeaderboardEntry[] | null;
  initialPlacementLeaderboard?: LeaderboardEntry[] | null;
};

export default function LeaderboardClient({
  initialCoinsLeaderboard = null,
  initialPlacementLeaderboard = null,
}: LeaderboardClientProps) {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = React.useState<"coins" | "placement">("coins");

  useEffect(() => {
    const run = async () => {
      await dispatch(
        assignMainLayout({
          type: "ASSIGN_OPEN_LOADER",
        }) as any,
      );
      await dispatch(
        assignMainLayout({
          type: "ASSIGN_CLOSE_LOADER",
        }) as any,
      );
    };
    run();
  }, [dispatch]);

  const activeLeaderboard =
    activeTab === "coins" ? initialCoinsLeaderboard : initialPlacementLeaderboard;

  return (
    <StudentCard>
      <Stack width="100%" alignItems="center">
        <Stack className="leaderboard-page-wrapper" width="100%">
          <Box sx={{ width: "100%", mb: 2 }}>
            <Tabs
              value={activeTab}
              onChange={(_, v) => setActiveTab(v)}
              centered
              sx={{
                "& .MuiTabs-indicator": { backgroundColor: "#8264FF" },
              }}
            >
              <Tab value="coins" label="Overall (Coins)" />
              <Tab value="placement" label="Placement Test (Score)" />
            </Tabs>
          </Box>

          <LeaderboardPage initialLeaderboard={activeLeaderboard} />
        </Stack>
      </Stack>
    </StudentCard>
  );
}


"use client";

import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { assignMainLayout } from "@/app/contexts/redux/actions";
import { StudentCard } from "@/src/app/components";
import { Stack } from "@mui/material";
import { RewardPage } from "@/components/templates";

type RewardItem = {
  id: number;
  name: string;
  category: string;
  cost: number;
  description: string;
  image: string | { default: string };
};

type RewardClientProps = {
  initialRewards?: RewardItem[] | null;
};

export default function RewardClient({
  initialRewards = null,
}: RewardClientProps) {
  const dispatch = useDispatch();

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

  return (
    <StudentCard>
      <Stack width="100%" alignItems="center">
        <Stack className="reward-page-wrapper">
          <RewardPage initialRewards={initialRewards} />
        </Stack>
      </Stack>
    </StudentCard>
  );
}


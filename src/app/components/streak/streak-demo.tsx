"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { StreakCard } from "@/components/streak/streak-card"
import { DailyStreakPopup } from "@/components/streak/daily-streak-popup"
import { CoinBalance } from "@/components/streak/coin-balance"
import { Timer } from "@/components/streak/count-up-timer"

export function StreakDemo() {
  const [consecutiveDays, setConsecutiveDays] = useState<number>(2)

  function handleIncrement() {
    setConsecutiveDays(days => Math.min(7, days + 1))
  }

  return (
    <div className="flex flex-col gap-4 items-center sm:items-start">
      <div className="flex gap-2 items-center">
        <Button onClick={handleIncrement} variant="default">
          +1 day
        </Button>
        <DailyStreakPopup consecutiveDays={consecutiveDays} />
        <CoinBalance />
      </div>
      <StreakCard consecutiveDays={consecutiveDays} />
      <div className="flex justify-center w-full mt-6">
        <Timer size={200} strokeWidth={10} maxMinutes={20} />
      </div>
    </div>
  )
}



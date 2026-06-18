"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CoinStack } from "@/components/streak/coin-stack"

export function CoinStackSelector() {
  const [count, setCount] = useState<1 | 2 | 3 | 5>(1)

  return (
    <div className="flex flex-col gap-3 items-center">
      <div className="flex gap-2">
        <Button size="sm" variant={count === 1 ? "default" : "outline"} onClick={() => setCount(1)}>1</Button>
        <Button size="sm" variant={count === 2 ? "default" : "outline"} onClick={() => setCount(2)}>2</Button>
        <Button size="sm" variant={count === 3 ? "default" : "outline"} onClick={() => setCount(3)}>3</Button>
        <Button size="sm" variant={count === 5 ? "default" : "outline"} onClick={() => setCount(5)}>5</Button>
      </div>
      <div 
        className="bg-white rounded-[16px] flex items-center justify-center shadow-[0_6px_12px_0_rgba(0,0,0,0.06)] transition-all duration-300"
        style={{
          width: count === 5 ? 172 : 96,
          height: count === 5 ? 92 : 56,
        }}
      >
        <CoinStack count={count} />
      </div>
    </div>
  )
}



"use client"

import Image from "next/image"

export function CoinStack2() {
  return (
    <div className="relative" style={{ width: 32, height: 35.99 }}>
      <Image
        src="/Point_Coin.png"
        alt="coin"
        width={32}
        height={28.71}
        style={{ position: "absolute", left: 0, top: 7.28, objectFit: "cover" }}
      />
      <Image
        src="/Point_Coin.png"
        alt="coin"
        width={32}
        height={28.71}
        style={{ position: "absolute", left: 28, top: 7.28, objectFit: "cover" }}
      />
    </div>
  )
}



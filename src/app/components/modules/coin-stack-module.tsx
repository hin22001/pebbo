"use client"

import Image from "next/image"

interface CoinStackModuleProps {
  count?: 1 | 2 | 3 | 5
}

export function CoinStackModule({ count = 1 }: CoinStackModuleProps) {
  const coinsToRender = Math.max(1, Math.min(5, count))

  if (coinsToRender === 1) {
    return (
      <div className="relative" style={{ width: 32, height: 35.99 }}>
        <Image
          src="/Coin.svg"
          alt="coin"
          width={32}
          height={28.71}
          style={{ position: "absolute", left: 0, top: 3, objectFit: "cover" }}
        />
      </div>
    )
  }

  if (coinsToRender === 2) {
    return (
      <div className="relative" style={{ width: 47, height: 35.99 }}>
        <Image
          src="/Coin.svg"
          alt="coin"
          width={32}
          height={28.71}
          style={{ position: "absolute", left: 0, top: 3, objectFit: "cover" }}
        />
        <Image
          src="/Coin.svg"
          alt="coin"
          width={32}
          height={28.71}
          style={{ position: "absolute", left: 15, top: 0, objectFit: "cover" }}
        />
      </div>
    )
  }

  if (coinsToRender === 5) {
    return (
      <div className="relative" style={{ width: 152, height: 72.71 }}>
        {/* point-coin2 (rightmost, bottom layer) */}
        <Image src="/Coin.svg" alt="coin" width={32} height={32} style={{ position: 'absolute', left: 120, top: 0 }} />
        {/* point-coin (leftmost) */}
        <Image src="/Coin.svg" alt="coin" width={32} height={32} style={{ position: 'absolute', left: 0, top: 44 }} />
        {/* point-coin4 */}
        <Image src="/Coin.svg" alt="coin" width={32} height={32} style={{ position: 'absolute', left: 90, top: 11 }} />
        {/* point-coin3 */}
        <Image src="/Coin.svg" alt="coin" width={32} height={32} style={{ position: 'absolute', left: 30, top: 33 }} />
        {/* point-coin5 (center, top layer) */}
        <Image src="/Coin.svg" alt="coin" width={32} height={32} style={{ position: 'absolute', left: 60, top: 22 }} />
      </div>
    )
  }

  return (
    <div className="relative" style={{ width: 60, height: 35.99 }}>
      <Image
        src="/Coin.svg"
        alt="coin"
        width={32}
        height={32}
        style={{ position: "absolute", left: 0, top: 3, objectFit: "cover" }}
      />
      <Image
        src="/Coin.svg"
        alt="coin"
        width={32}
        height={32}
        style={{ position: "absolute", left: 28, top: 3, objectFit: "cover" }}
      />
      <Image
        src="/Coin.svg"
        alt="coin"
        width={32}
        height={32}
        style={{ position: "absolute", left: 14, top: 0, objectFit: "cover" }}
      />
    </div>
  )
}

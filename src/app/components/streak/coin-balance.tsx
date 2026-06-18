"use client"

import Image from "next/image"
import { useEffect, useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"

export function CoinBalance() {
  const [coins, setCoins] = useState<number>(218)
  const [displayCoins, setDisplayCoins] = useState<number>(218)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [phase, setPhase] = useState<"blast" | "decel" | "pulse" | "done">("done")
  const [isJumping, setIsJumping] = useState(false)
  const [isNumberPop, setIsNumberPop] = useState(false)
  const [isFinalPop, setIsFinalPop] = useState(false)
  const [isFinalPopTwo, setIsFinalPopTwo] = useState(false)
  const animationFrameRef = useRef<number | null>(null)
  const timersRef = useRef<NodeJS.Timeout[]>([])

  function addCoins(amount: number) {
    setCoins(v => v + amount)
    if (!audioRef.current) audioRef.current = new Audio("/game-bonus-02-294436.mp3")
    audioRef.current.currentTime = 0
    audioRef.current.play().catch(() => {})
  }

  function triggerIncrement(amount: number) {
    addCoins(amount)

    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
    // Reset pop states immediately
    setIsJumping(false)
    setIsNumberPop(false)
    setIsFinalPop(false)
    setIsFinalPopTwo(false)

    const startValue = displayCoins
    const targetValue = startValue + amount
    let startTime: number | null = null

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const elapsed = timestamp - startTime

      // New Accelerated Timeline
      const blastEnd = 300       // Phase 1: 300ms
      const decelEnd = 1000      // Phase 2: 700ms
      const pulseEnd = 1200      // Phase 3: 200ms (2x speed)
      const numberPopStart = 1225 // 25ms gap
      const numberPopEnd = 1300  // Phase 5: 75ms
      const finalPopOneStart = 1300   // Phase 6a: 100ms
      const finalPopOneEnd = 1400
      const finalPopTwoStart = 1400   // Phase 6b: 100ms
      const finalPopTwoEnd = 1500
      const restoreEnd = 1800    // Phase 7: 300ms (for transition)

      // Update count based on elapsed time
      if (elapsed < blastEnd) {
        if (phase !== "blast") setPhase("blast")
        const progress = elapsed / blastEnd
        setDisplayCoins(startValue + Math.floor((targetValue * 0.9 - startValue) * progress))
      } else if (elapsed < decelEnd) {
        if (phase !== "decel") {
          setPhase("decel")
          setIsJumping(true) // FIX: Trigger coin jump with dedicated state
          timersRef.current.push(setTimeout(() => setIsJumping(false), 1350)) // 3 animation loops
        }
        const progress = (elapsed - blastEnd) / (decelEnd - blastEnd)
        const easeOut = 1 - Math.pow(1 - progress, 3)
        setDisplayCoins(Math.floor(targetValue * 0.9) + Math.floor((targetValue * 0.05) * easeOut))
      } else if (elapsed < pulseEnd) {
        if (phase !== "pulse") setPhase("pulse")
        const progress = (elapsed - decelEnd) / (pulseEnd - decelEnd)
        setDisplayCoins(Math.floor(targetValue * 0.95) + Math.floor((targetValue * 0.05) * progress))
      } else {
        if (phase !== "done") {
          setPhase("done")
          setDisplayCoins(targetValue)
        }
      }

      // Handle pop animations
      setIsNumberPop(elapsed >= numberPopStart && elapsed < numberPopEnd)
      setIsFinalPop(elapsed >= finalPopOneStart && elapsed < finalPopOneEnd)
      setIsFinalPopTwo(elapsed >= finalPopTwoStart && elapsed < finalPopTwoEnd)

      if (elapsed < restoreEnd) {
        animationFrameRef.current = requestAnimationFrame(animate)
      } else {
        // Final cleanup
        animationFrameRef.current = null
        setPhase("done")
        setDisplayCoins(targetValue)
        setIsJumping(false)
        setIsNumberPop(false)
        setIsFinalPop(false)
        setIsFinalPopTwo(false)
      }
    }

    animationFrameRef.current = requestAnimationFrame(animate)
  }

  const progress = displayCoins / (coins || 1) // Avoid division by zero

  const getTextColor = () => {
    if (phase === "done") return "rgb(0, 0, 0)"
    if (progress < 0.5) {
      const t = progress * 2
      return `rgb(${Math.floor(250 * t)}, ${Math.floor(204 * t)}, ${Math.floor(21 * t)})`
    }
    if (progress < 0.95) return "rgb(250, 204, 21)"
    const t = (progress - 0.95) / 0.05
    return `rgb(${Math.floor(250 * (1 - t))}, ${Math.floor(204 * (1 - t))}, ${Math.floor(21 * (1 - t))})`
  }

  const textStyle: React.CSSProperties = {
    color: getTextColor(),
    textShadow: phase === "pulse" ? "0 0 20px rgba(250, 204, 21, 0.8)" : "none",
    transform: `
      scale(${isFinalPop || isFinalPopTwo ? 1.4 : isNumberPop ? 1.25 : phase === 'pulse' ? 1.25 : 1})
    `,
    transition: "transform 0.2s cubic-bezier(0.68, -0.55, 0.265, 1.55), color 0.1s ease",
  }

  const chipStyle: React.CSSProperties = {
    transform: `scale(${isFinalPop || isFinalPopTwo ? 1.1 : isNumberPop ? 1.05 : 1})`,
    transition: 'transform 0.3s ease-in-out',
  }

  return (
    <div className="flex items-center gap-3">
      <div style={chipStyle} className="bg-white rounded-[48px] px-4 py-[18px] flex items-center gap-[12px] shadow-lg">
        <div className={`relative w-[36px] h-[36px] shrink-0 ${isJumping ? 'animate-coin-jump' : ''}`}>
          <Image src="/Coin.svg" alt="coin" width={36} height={32.3} className="absolute left-0 top-0" />
        </div>
        <div className="relative inline-block select-none p-2">
          <span
            style={textStyle}
            className={`text-[24px] leading-[36px] font-medium antialiased tabular-nums`}
          >
            {displayCoins}
          </span>
        </div>
      </div>
      <div className="flex gap-2 flex-wrap">
        <Button size="sm" onClick={() => triggerIncrement(1)}>+1</Button>
        <Button size="sm" variant="secondary" onClick={() => triggerIncrement(2)}>+2</Button>
        <Button size="sm" variant="outline" onClick={() => triggerIncrement(3)}>+3</Button>
        <Button size="sm" variant="outline" onClick={() => triggerIncrement(5)}>+5</Button>
      </div>
    </div>
  )
}



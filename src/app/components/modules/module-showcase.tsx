"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DailyStreakReward } from "@/components/modules/daily-streak-reward"
import { TimerModule } from "@/components/modules/timer-module"
import { CoinBalanceModule } from "@/components/modules/coin-balance-module"
import { CoinStackModule } from "@/components/modules/coin-stack-module"
import { StreakCard } from "@/components/streak/streak-card"

type ModuleType = "daily-streak" | "timer" | "coin-balance" | "coin-stack" | "streak-card" | null

export function ModuleShowcase() {
  const [activeModule, setActiveModule] = useState<ModuleType>(null)
  const [consecutiveDays, setConsecutiveDays] = useState<number>(2)
  const [copiedModule, setCopiedModule] = useState<ModuleType | null>(null)

  const copyToClipboard = async (text: string, moduleId: ModuleType) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedModule(moduleId)
      setTimeout(() => setCopiedModule(null), 2000) // Reset after 2 seconds
    } catch (err) {
      console.error('Failed to copy text: ', err)
      alert('Failed to copy code. Please try again.')
    }
  }

  const modules = [
    {
      id: "daily-streak" as ModuleType,
      name: "Daily Streak Reward",
      description: "Complete streak reward system with trophy animation",
      component: <DailyStreakReward consecutiveDays={consecutiveDays} />
    },
    {
      id: "timer" as ModuleType,
      name: "Timer Animation",
      description: "Animated timer with progress circle and color changes",
      component: <TimerModule size={200} strokeWidth={10} maxMinutes={20} />
    },
    {
      id: "coin-balance" as ModuleType,
      name: "Coin Balance",
      description: "Interactive coin balance with animations and sound",
      component: <CoinBalanceModule initialCoins={218} />
    },
    {
      id: "coin-stack" as ModuleType,
      name: "Coin Stack Images",
      description: "Various coin stack configurations",
      component: (
        <div className="flex gap-4 items-center">
          <CoinStackModule count={1} />
          <CoinStackModule count={2} />
          <CoinStackModule count={3} />
          <CoinStackModule count={5} />
        </div>
      )
    },
    {
      id: "streak-card" as ModuleType,
      name: "Streak Card with Circles",
      description: "Day streak display with animated circles",
      component: <StreakCard consecutiveDays={consecutiveDays} />
    }
  ]

  const getModuleCode = (moduleId: ModuleType) => {
    switch (moduleId) {
      case "daily-streak":
        return `// 1. Copy this component file: src/components/modules/daily-streak-reward.tsx
"use client"

import Image from "next/image"
import { CoinStackModule } from "./coin-stack-module"
import { useState, useEffect } from "react"

interface DailyStreakRewardProps {
  consecutiveDays: number
}

export function DailyStreakReward({ consecutiveDays }: DailyStreakRewardProps) {
  const [dayToAnimate, setDayToAnimate] = useState<number | null>(null)
  const [day7AnimationClasses, setDay7AnimationClasses] = useState('')
  const [trophyAnimation, setTrophyAnimation] = useState('')

  useEffect(() => {
    setDayToAnimate(consecutiveDays)
  }, [consecutiveDays])

  useEffect(() => {
    setTrophyAnimation('animate-streak-wiggle')
  }, [])

  const isDay7Active = consecutiveDays >= 7

  useEffect(() => {
    if (isDay7Active && dayToAnimate === 7) {
      const timers: NodeJS.Timeout[] = []
      setDay7AnimationClasses('animate-restore-color')
      timers.push(setTimeout(() => setDay7AnimationClasses(prev => \`\${prev} animate-metal-sheen\`), 133))
      timers.push(setTimeout(() => setDay7AnimationClasses(prev => \`\${prev.replace('animate-metal-sheen', '')} animate-card-pop\`), 533))
      timers.push(setTimeout(() => setDay7AnimationClasses(prev => \`\${prev} animate-card-glow\`), 867))
      timers.push(setTimeout(() => setDay7AnimationClasses(''), 1533))
      return () => timers.forEach(clearTimeout)
    } else {
      setDay7AnimationClasses('')
    }
  }, [isDay7Active, dayToAnimate])

  return (
    <div className="w-[358px] h-[538px] rounded-[20px] bg-white shadow-[0_6px_12px_0_rgba(0,0,0,0.07)] overflow-hidden relative">
      <div className="absolute left-1/2 -translate-x-1/2 top-8 flex flex-col items-center select-none z-10">
        <Image 
          src="/streak trophy.png" 
          alt="streak trophy" 
          width={80} 
          height={80}
          className={\`select-none \${trophyAnimation}\`}
        />
      </div>
      <p className="absolute left-1/2 -translate-x-1/2 top-[150px] text-[#8264ff] text-[18px] leading-[27px] font-medium">
        Daily Streak Reward
      </p>
      <div className="absolute left-[40px] top-[187px] w-[278px]">
        <div className="grid grid-cols-3 gap-x-2 gap-y-4">
          {Array.from({ length: 6 }, (_, i) => {
            const day = i + 1
            const cardData = [
              { color: "rgba(165,145,249,0.2)", reward: 5, accent: "text-[#8264ff]" },
              { color: "rgba(0,205,210,0.2)", reward: 10, accent: "text-[#00cdd2]" },
              { color: "rgba(255,143,0,0.2)", reward: 15, accent: "text-[#ff8f00]" },
              { color: "rgba(255,143,0,0.2)", reward: 20, accent: "text-[#ff8f00]" },
              { color: "rgba(165,145,249,0.2)", reward: 25, accent: "text-[#8264ff]" },
              { color: "rgba(0,205,210,0.2)", reward: 35, accent: "text-[#00cdd2]" },
            ][i]
            const coinCount: 1 | 2 | 3 = day <= 3 ? 1 : day <= 5 ? 2 : 3
            const showFireIcon = day === consecutiveDays
            const isFireAnimated = dayToAnimate === day
            return (
              <div key={day} className="relative">
                <Card
                  dayLabel={\`Day 0\${day}\`}
                  isClaimed={consecutiveDays > day}
                  isToBeAnimated={dayToAnimate === day}
                  coinCount={coinCount}
                  showFireIcon={false}
                  {...cardData}
                />
                {showFireIcon && (
                  <FireIconWithDelay isAnimated={isFireAnimated} />
                )}
              </div>
            )
          })}
        </div>
      </div>
      <div
        className={\`absolute left-[40px] top-[395px] w-[278px] h-[105px] rounded-[16px] shadow-lg overflow-hidden relative \${!isDay7Active ? 'grayscale' : ''} \${day7AnimationClasses}\`}
        style={{
          background: "linear-gradient(to bottom, rgba(255,143,0,0.25) 0%, rgba(0,205,210,0.5) 100%)",
          '--glow-color': hexToRgba('#00cdd2', 0.8)
        } as React.CSSProperties}
      >
        <p className="absolute left-[22px] top-[6px] text-[#ff5000] text-[12px] font-bold leading-[18px] z-20">Day 07</p>
        <p className="absolute right-[12px] top-[4px] text-[#ff5000] text-[26px] font-semibold leading-[36px] z-20">+50</p>
        <div className="absolute left-[16px] top-[6px]">
          <CoinStackModule count={5} />
        </div>
        <div className="absolute right-[35px] bottom-[12px]">
          <Image src="/Reward Sticker.png" alt="reward" width={85} height={72} />
        </div>
      </div>
    </div>
  )
}

// Helper components and functions (include these too)
interface CardProps {
  color: string
  dayLabel: string
  reward: number
  accent: string
  isClaimed: boolean
  isToBeAnimated: boolean
  coinCount: 1 | 2 | 3
  showFireIcon: boolean
}

function Card({ color, dayLabel, reward, accent, isClaimed, isToBeAnimated, coinCount, showFireIcon }: CardProps) {
  const [animationClasses, setAnimationClasses] = useState('')
  useEffect(() => {
    if (isToBeAnimated) {
      const timers: NodeJS.Timeout[] = []
      setAnimationClasses('animate-restore-color')
      timers.push(setTimeout(() => setAnimationClasses(prev => \`\${prev} animate-metal-sheen\`), 133))
      timers.push(setTimeout(() => setAnimationClasses(prev => \`\${prev.replace('animate-metal-sheen', '')} animate-card-pop\`), 533))
      timers.push(setTimeout(() => setAnimationClasses(prev => \`\${prev} animate-card-glow\`), 867))
      timers.push(setTimeout(() => setAnimationClasses(''), 1533))
      return () => timers.forEach(clearTimeout)
    } else {
      setAnimationClasses('')
    }
  }, [isToBeAnimated])
  const grayscaleClass = !isClaimed && !isToBeAnimated ? 'grayscale' : ''
  const accentColor = accent.match(/#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})/)?.[0] || '#000'
  return (
    <div
      className={\`relative overflow-hidden rounded-[20px] \${grayscaleClass} \${animationClasses} isolate\`}
      style={{ '--glow-color': hexToRgba(accentColor, 0.7) } as React.CSSProperties}
    >
      <div className="w-[86px] h-[90px] rounded-[20px] shadow-[0_6px_12px_0_rgba(0,0,0,0.03)]" style={{ background: color }} />
      <p className="absolute left-1/2 -translate-x-1/2 top-[8px] text-[#ff5000] text-[12px] leading-[18px] font-bold z-10">{dayLabel}</p>
      <div className="absolute left-1/2 -translate-x-1/2 top-[30px] w-[60px] h-[34px] flex items-center justify-center">
        <div className="w-full h-full rounded-[8px] flex items-center justify-center">
          <CoinStackModule count={coinCount} />
        </div>
      </div>
      <p className={\`absolute left-1/2 -translate-x-1/2 top-[64px] text-[16px] leading-[24px] font-semibold z-10 \${accent}\`}>+{reward}</p>
    </div>
  )
}

function FireIconWithDelay({ isAnimated }: { isAnimated: boolean }) {
  const [fireAnimationClasses, setFireAnimationClasses] = useState('')
  const [isVisible, setIsVisible] = useState(false)
  useEffect(() => {
    if (isAnimated) {
      const timer = setTimeout(() => {
        setIsVisible(true)
        setFireAnimationClasses('animate-card-pop')
        const wiggleTimer = setTimeout(() => {
          setFireAnimationClasses('animate-card-pop animate-streak-wiggle')
        }, 300)
        return () => clearTimeout(wiggleTimer)
      }, 867)
      return () => clearTimeout(timer)
    } else {
      setFireAnimationClasses('')
      setIsVisible(false)
    }
  }, [isAnimated])
  return (
    <div className="absolute -bottom-2 pointer-events-none" style={{ right: '-5pt' }}>
      <div 
        className={fireAnimationClasses}
        style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'scale(1)' : 'scale(0)',
          transition: 'opacity 0.1s ease-out, transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)'
        }}
      >
        <Image 
          src="/Point_Fire.png" 
          alt="fire" 
          width={30} 
          height={30} 
          className="select-none will-change-transform"
          style={{ 
            width: '30pt', 
            height: '30pt',
            objectFit: 'contain'
          }}
        />
      </div>
    </div>
  )
}

function hexToRgba(hex: string, alpha: number) {
  const clean = hex.replace("#", "")
  const r = parseInt(clean.slice(0, 2), 16)
  const g = parseInt(clean.slice(2, 4), 16)
  const b = parseInt(clean.slice(4, 6), 16)
  return \`rgba(\${r}, \${g}, \${b}, \${alpha})\`
}

// 2. Also copy the CoinStackModule component to the same directory:
// File: src/components/modules/coin-stack-module.tsx
/*
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
        <Image src="/Coin.svg" alt="coin" width={32} height={32} style={{ position: 'absolute', left: 120, top: 0 }} />
        <Image src="/Coin.svg" alt="coin" width={32} height={32} style={{ position: 'absolute', left: 0, top: 44 }} />
        <Image src="/Coin.svg" alt="coin" width={32} height={32} style={{ position: 'absolute', left: 90, top: 11 }} />
        <Image src="/Coin.svg" alt="coin" width={32} height={32} style={{ position: 'absolute', left: 30, top: 33 }} />
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
*/

// 3. Add these CSS animations to your globals.css:
/*
@keyframes streak-wiggle {
  0% { transform: translateZ(0) scale(1) rotate(0deg); }
  20% { transform: translateZ(0) scale(1.05) rotate(-4deg); }
  50% { transform: translateZ(0) scale(1.05) rotate(4deg); }
  80% { transform: translateZ(0) scale(1.03) rotate(-2deg); }
  100% { transform: translateZ(0) scale(1) rotate(0deg); }
}
.animate-streak-wiggle {
  animation: streak-wiggle 600ms ease-in-out both;
}
@keyframes restore-color {
  from { filter: grayscale(100%); }
  to { filter: grayscale(0%); }
}
@keyframes metal-sheen {
  0% { transform: translateX(-100%) skewX(-20deg); }
  100% { transform: translateX(200%) skewX(-20deg); }
}
@keyframes card-pop {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.07); }
}
@keyframes card-glow {
  0%, 100% { box-shadow: 0 0 0 0 rgba(0,0,0,0); }
  50% { box-shadow: 0 0 20px 8px var(--glow-color, rgba(255,193,7,0.7)); }
}
.animate-restore-color {
  animation: restore-color 0.5s ease-in forwards;
}
.animate-metal-sheen::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 50%;
  height: 100%;
  background: linear-gradient(to right, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.5) 50%, rgba(255, 255, 255, 0) 100%);
  animation: metal-sheen 0.7s ease-in-out;
  opacity: 0.8;
}
.animate-card-pop {
  animation: card-pop 0.5s ease-out;
}
.animate-card-glow {
  animation: card-glow 1s ease-in-out forwards;
}
*/

// 4. Usage in your component:
<DailyStreakReward consecutiveDays={2} />`

      case "timer":
        return `// 1. Copy this component file: src/components/modules/timer-module.tsx
"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"

interface TimerModuleProps {
  size?: number
  strokeWidth?: number
  maxMinutes?: number
}

export function TimerModule({ 
  size = 120, 
  strokeWidth = 8,
  maxMinutes = 20 
}: TimerModuleProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const startTimeRef = useRef<number>(Date.now())

  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000)
      setElapsedSeconds(elapsed)
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const maxSeconds = maxMinutes * 60
  const progress = Math.min(elapsedSeconds / maxSeconds, 1)
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (progress * circumference)

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return \`\${mins.toString().padStart(2, '0')}:\${secs.toString().padStart(2, '0')}\`
  }

  const getColor = () => {
    if (progress < 0.5) return '#8264ff'
    if (progress < 0.75) return '#ff8f00'
    if (progress < 1) return '#f03c00'
    return '#00cdd2'
  }

  return (
    <div className="bg-white rounded-[30px] shadow-[0_9px_18px_0_rgba(0,0,0,0.07)] p-8 flex flex-col items-center gap-4">
      <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
        <svg 
          width={size} 
          height={size} 
          className="transform -rotate-90 absolute inset-0"
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(0,0,0,0.1)"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={getColor()}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{
              transition: 'stroke-dashoffset 0.5s ease, stroke 0.3s ease'
            }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <Image 
            src="/timer sticker.svg" 
            alt="timer" 
            width={size * 0.6} 
            height={size * 0.6}
            className="select-none"
          />
        </div>
      </div>
      <div className="flex flex-col items-center gap-2">
        <span 
          className="font-bold tabular-nums"
          style={{ 
            color: getColor(),
            fontSize: size * 0.18,
            lineHeight: 1
          }}
        >
          {formatTime(elapsedSeconds)}
        </span>
        <p className="text-[16px] font-medium text-[#8264ff]">
          20 minutes a day in Pebbo!
        </p>
      </div>
    </div>
  )
}

// 2. Usage in your component:
<TimerModule size={200} strokeWidth={10} maxMinutes={20} />`

      case "coin-balance":
        return `// 1. Copy this component file: src/components/modules/coin-balance-module.tsx
"use client"

import Image from "next/image"
import { useEffect, useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"

interface CoinBalanceModuleProps {
  initialCoins?: number
}

export function CoinBalanceModule({ initialCoins = 218 }: CoinBalanceModuleProps) {
  const [coins, setCoins] = useState<number>(initialCoins)
  const [displayCoins, setDisplayCoins] = useState<number>(initialCoins)
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

      const blastEnd = 300
      const decelEnd = 1000
      const pulseEnd = 1200
      const numberPopStart = 1225
      const numberPopEnd = 1300
      const finalPopOneStart = 1300
      const finalPopOneEnd = 1400
      const finalPopTwoStart = 1400
      const finalPopTwoEnd = 1500
      const restoreEnd = 1800

      if (elapsed < blastEnd) {
        if (phase !== "blast") setPhase("blast")
        const progress = elapsed / blastEnd
        const incrementAmount = targetValue - startValue
        setDisplayCoins(startValue + Math.floor(incrementAmount * 0.9 * progress))
      } else if (elapsed < decelEnd) {
        if (phase !== "decel") {
          setPhase("decel")
          setIsJumping(true)
          timersRef.current.push(setTimeout(() => setIsJumping(false), 1350))
        }
        const progress = (elapsed - blastEnd) / (decelEnd - blastEnd)
        const easeOut = 1 - Math.pow(1 - progress, 3)
        const incrementAmount = targetValue - startValue
        setDisplayCoins(startValue + Math.floor(incrementAmount * 0.9) + Math.floor(incrementAmount * 0.05 * easeOut))
      } else if (elapsed < pulseEnd) {
        if (phase !== "pulse") setPhase("pulse")
        const progress = (elapsed - decelEnd) / (pulseEnd - decelEnd)
        const incrementAmount = targetValue - startValue
        setDisplayCoins(startValue + Math.floor(incrementAmount * 0.95) + Math.floor(incrementAmount * 0.05 * progress))
      } else {
        if (phase !== "done") {
          setPhase("done")
          setDisplayCoins(targetValue)
        }
      }

      setIsNumberPop(elapsed >= numberPopStart && elapsed < numberPopEnd)
      setIsFinalPop(elapsed >= finalPopOneStart && elapsed < finalPopOneEnd)
      setIsFinalPopTwo(elapsed >= finalPopTwoStart && elapsed < finalPopTwoEnd)

      if (elapsed < restoreEnd) {
        animationFrameRef.current = requestAnimationFrame(animate)
      } else {
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

  // Calculate animation progress based on the current increment animation
  const getAnimationProgress = () => {
    if (phase === "done") return 1
    if (phase === "blast") return 0.3
    if (phase === "decel") return 0.6
    if (phase === "pulse") return 0.9
    return 0
  }

  const animationProgress = getAnimationProgress()

  const getTextColor = () => {
    if (phase === "done") return "rgb(0, 0, 0)"
    if (animationProgress < 0.5) {
      const t = animationProgress * 2
      return \`rgb(\${Math.floor(250 * t)}, \${Math.floor(204 * t)}, \${Math.floor(21 * t)})\`
    }
    if (animationProgress < 0.95) return "rgb(250, 204, 21)"
    const t = (animationProgress - 0.95) / 0.05
    return \`rgb(\${Math.floor(250 * (1 - t))}, \${Math.floor(204 * (1 - t))}, \${Math.floor(21 * (1 - t))})\`
  }

  const textStyle: React.CSSProperties = {
    color: getTextColor(),
    textShadow: phase === "pulse" ? "0 0 20px rgba(250, 204, 21, 0.8)" : "none",
    transform: \`scale(\${isFinalPop || isFinalPopTwo ? 1.4 : isNumberPop ? 1.25 : phase === 'pulse' ? 1.25 : 1})\`,
    transition: "transform 0.2s cubic-bezier(0.68, -0.55, 0.265, 1.55), color 0.1s ease",
  }

  const chipStyle: React.CSSProperties = {
    transform: \`scale(\${isFinalPop || isFinalPopTwo ? 1.1 : isNumberPop ? 1.05 : 1})\`,
    transition: 'transform 0.3s ease-in-out',
  }

  return (
    <div className="flex items-center gap-3">
      <div style={chipStyle} className="bg-white rounded-[48px] px-4 py-[18px] flex items-center gap-[12px] shadow-lg">
        <div className={\`relative w-[36px] h-[36px] shrink-0 \${isJumping ? 'animate-coin-jump' : ''}\`}>
          <Image src="/Coin.svg" alt="coin" width={36} height={32.3} className="absolute left-0 top-0" />
        </div>
        <div className="relative inline-block select-none p-2">
          <span
            style={textStyle}
            className={\`text-[24px] leading-[36px] font-medium antialiased tabular-nums\`}
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

// 2. Add these CSS animations to your globals.css:
/*
@keyframes coin-jump {
  0% { transform: translateY(0); }
  20% { transform: translateY(-12px); }
  40% { transform: translateY(0); }
  60% { transform: translateY(-8px); }
  80% { transform: translateY(0); }
  100% { transform: translateY(0); }
}
.animate-coin-jump {
  animation: coin-jump 450ms ease-out 0s 3;
}
*/

// 3. Add the sound file: public/game-bonus-02-294436.mp3
// 4. Add the coin image: public/Coin.svg
// 5. Usage in your component:
<CoinBalanceModule initialCoins={218} />`

      case "coin-stack":
        return `// 1. Copy this component file: src/components/modules/coin-stack-module.tsx
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
        <Image src="/Coin.svg" alt="coin" width={32} height={32} style={{ position: 'absolute', left: 120, top: 0 }} />
        <Image src="/Coin.svg" alt="coin" width={32} height={32} style={{ position: 'absolute', left: 0, top: 44 }} />
        <Image src="/Coin.svg" alt="coin" width={32} height={32} style={{ position: 'absolute', left: 90, top: 11 }} />
        <Image src="/Coin.svg" alt="coin" width={32} height={32} style={{ position: 'absolute', left: 30, top: 33 }} />
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

// 2. Add the coin image: public/Coin.svg
// 3. Usage in your component:
<CoinStackModule count={1} />
<CoinStackModule count={2} />
<CoinStackModule count={3} />
<CoinStackModule count={5} />`

      case "streak-card":
        return `// 1. Copy this component file: src/components/streak/streak-card.tsx
"use client"

import Image from "next/image"
import { useMemo, useState, useEffect, useRef } from "react"

export function StreakCard({ fireSrc = "/Point_Fire.png", coinSrc = "/Coin.svg", consecutiveDays = 2 }: StreakCardProps) {
  const [animatedDay, setAnimatedDay] = useState<number | null>(null)
  const prevConsecutiveDays = useRef(consecutiveDays)

  useEffect(() => {
    if (consecutiveDays > prevConsecutiveDays.current) {
      setAnimatedDay(consecutiveDays - 1)
      const timer = setTimeout(() => setAnimatedDay(null), 1000)
      return () => clearTimeout(timer)
    }
    prevConsecutiveDays.current = consecutiveDays
  }, [consecutiveDays])

  const states = useMemo(() => Array.from({ length: 7 }, (_, i) => i < consecutiveDays), [consecutiveDays])

  return (
    <div className="w-[559px] h-[353px] rounded-[30px] bg-white shadow-[0_9px_18px_0_rgba(0,0,0,0.07)] relative overflow-hidden select-none p-6 pt-[210px]">
      <div key={consecutiveDays} className={"absolute left-1/2 -translate-x-1/2 top-1 flex items-center justify-center animate-streak-wiggle"}>
        <Image src={fireSrc} alt="streak" width={138} height={138} className="select-none will-change-transform" priority />
        <div
          className="absolute text-white leading-none text-[84px] tracking-tight translate-y-[52px] antialiased [font-variant-numeric:tabular-nums]"
          style={{ 
            WebkitTextStroke: "4px #000", 
            textRendering: "optimizeLegibility",
            fontFamily: "var(--font-poppins), 'Poppins', 'Inter', 'SF Pro Display', 'Helvetica Neue', system-ui, -apple-system, sans-serif",
            fontWeight: "900",
            letterSpacing: "-0.02em",
            WebkitFontSmoothing: "antialiased",
            MozOsxFontSmoothing: "grayscale"
          }}
        >
          {consecutiveDays}
        </div>
      </div>
      <p className="day-streak absolute left-1/2 -translate-x-1/2 top-[160px]">
        Day streak!
      </p>
      <div className="mx-auto w-[348px] flex justify-center gap-3 sm:gap-4">
        {states.map((active, i) => (
          <StreakCircle
            key={\`fire-\${i}\`}
            isActive={active}
            color="#FF8F00"
            isAnimated={i === animatedDay}
          >
            <Image src={fireSrc} alt="fire" width={24} height={24} className="pointer-events-none" />
          </StreakCircle>
        ))}
      </div>
      <div className="mx-auto w-[348px] flex justify-center gap-3 sm:gap-4 mt-4 items-center">
        {states.map((active, i) => (
          <div key={\`coin-\${i}\`} className="w-10 flex flex-col items-center gap-1">
            <StreakCircle
              isActive={active}
              color="#FF5000"
              isAnimated={i === animatedDay}
            >
              <Image src={coinSrc} alt="coin" width={22} height={19.74} className="pointer-events-none" />
            </StreakCircle>
            <span className={\`text-[14px] font-semibold text-[#ff5000] \${active ? "opacity-100" : "opacity-40"}\`}>+{(i + 1) * 5}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function StreakCircle({ isActive, color, children, isAnimated }: { isActive: boolean; color: string; children: React.ReactNode; isAnimated?: boolean }) {
  const animationClasses = isAnimated ? 'animate-number-pop-effect animate-final-pop' : ''
  const neonGlow = isActive ? {
    boxShadow: \`0 0 1px \${hexToRgba(color, 0.25)}, 0 0 2px \${hexToRgba(color, 0.25)}, 0 0 3px \${hexToRgba(color, 0.25)}\`,
  } : {}
  return (
    <div
      className={\`size-10 aspect-square rounded-full overflow-hidden shrink-0 flex items-center justify-center transition-all duration-300 \${animationClasses}\`}
      style={{
        backgroundColor: hexToRgba(color, 0.2),
        opacity: isActive ? 1 : 0.3,
        ...neonGlow
      }}
    >
      {children}
    </div>
  )
}

function hexToRgba(hex: string, alpha: number) {
  const clean = hex.replace("#", "")
  const r = parseInt(clean.slice(0, 2), 16)
  const g = parseInt(clean.slice(2, 4), 16)
  const b = parseInt(clean.slice(4, 6), 16)
  return \`rgba(\${r}, \${g}, \${b}, \${alpha})\`
}

export interface StreakCardProps {
  fireSrc?: string
  coinSrc?: string
  consecutiveDays?: number
}

// 2. Add Poppins font to your layout.tsx:
/*
import { Poppins } from "next/font/google";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

// Add to body className: \${poppins.variable}
*/

// 3. Add these CSS animations to your globals.css:
/*
@keyframes streak-wiggle {
  0% { transform: translateZ(0) scale(1) rotate(0deg); }
  20% { transform: translateZ(0) scale(1.05) rotate(-4deg); }
  50% { transform: translateZ(0) scale(1.05) rotate(4deg); }
  80% { transform: translateZ(0) scale(1.03) rotate(-2deg); }
  100% { transform: translateZ(0) scale(1) rotate(0deg); }
}
@keyframes number-pop-effect {
  0% { transform: scale(1); }
  50% { transform: scale(1.25); }
  100% { transform: scale(1); }
}
@keyframes final-pop {
  0% { transform: scale(1); }
  50% { transform: scale(1.4); }
  100% { transform: scale(1); }
}
.animate-streak-wiggle {
  animation: streak-wiggle 600ms ease-in-out both;
}
.animate-number-pop-effect {
  animation: number-pop-effect 300ms ease-out;
}
.animate-final-pop {
  animation: final-pop 400ms ease-out;
}
.day-streak {
  color: #8d8d8d;
  text-align: center;
  font-family: "Inter-Regular", "Inter", system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
  font-size: 20px;
  line-height: 36.26px;
  font-weight: 400 !important;
}
*/

// 4. Add the images: public/Point_Fire.png, public/Coin.svg
// 5. Usage in your component:
<StreakCard consecutiveDays={2} />`

      default:
        return ""
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Interactive Components Showcase
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Click on any of the 5 modules below to see the component and copy the code
          </p>
          
          {/* Streak control */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <span className="text-sm font-medium text-gray-700">Streak Days:</span>
            <Button 
              onClick={() => setConsecutiveDays(Math.max(1, consecutiveDays - 1))}
              variant="outline"
              size="sm"
            >
              -1
            </Button>
            <span className="text-lg font-semibold text-gray-900 min-w-[2rem] text-center">
              {consecutiveDays}
            </span>
            <Button 
              onClick={() => setConsecutiveDays(Math.min(7, consecutiveDays + 1))}
              variant="outline"
              size="sm"
            >
              +1
            </Button>
          </div>
        </div>

        {/* Module buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {modules.map((module) => (
            <Button
              key={module.id}
              onClick={() => setActiveModule(module.id)}
              variant={activeModule === module.id ? "default" : "outline"}
              className="h-auto p-6 flex flex-col items-center gap-3"
            >
              <div className="text-lg font-semibold">{module.name}</div>
              <div className="text-sm text-center opacity-80">
                {module.description}
              </div>
            </Button>
          ))}
        </div>

        {/* Active module display */}
        {activeModule && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Component preview */}
              <div>
                <h3 className="text-xl font-semibold mb-4">Component Preview</h3>
                <div className="flex justify-center items-center min-h-[400px] bg-gray-50 rounded-lg p-4">
                  {modules.find(m => m.id === activeModule)?.component}
                </div>
              </div>

              {/* Code */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold">Code to Copy</h3>
                  <Button
                    onClick={() => copyToClipboard(getModuleCode(activeModule), activeModule)}
                    size="sm"
                  >
                    {copiedModule === activeModule ? "Copied!" : "Copy Code"}
                  </Button>
                </div>
                
                <div className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto max-h-[400px]">
                  <pre className="text-sm font-mono whitespace-pre-wrap">
                    {getModuleCode(activeModule)}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            How to Use These Components
          </h3>
          <div className="text-blue-800 space-y-2">
            <p>1. Click on any module button above to see the component in action</p>
            <p>2. Click "Copy Code" to copy the complete, ready-to-use code</p>
            <p>3. The component preview shows exactly what the copied code will produce</p>
            <p>4. All animations, sounds, fonts, and styling are included - truly copy-paste ready!</p>
          </div>
        </div>
      </div>
    </div>
  )
}

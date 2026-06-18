"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

interface CoinBalanceModuleProps {
  initialCoins?: number;
}

export function CoinBalanceModule({
  initialCoins = 218,
}: CoinBalanceModuleProps) {
  // Use localStorage to persist coin balance
  const [coins, setCoins] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("coinBalance");
      return saved ? parseInt(saved) : initialCoins;
    }
    return initialCoins;
  });
  const [displayCoins, setDisplayCoins] = useState<number>(coins);

  // Update displayCoins when coins change
  useEffect(() => {
    setDisplayCoins(coins);
  }, [coins]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [phase, setPhase] = useState<"blast" | "decel" | "pulse" | "done">(
    "done"
  );
  const [isJumping, setIsJumping] = useState(false);
  const [isNumberPop, setIsNumberPop] = useState(false);
  const [isFinalPop, setIsFinalPop] = useState(false);
  const [isFinalPopTwo, setIsFinalPopTwo] = useState(false);
  const animationFrameRef = useRef<number | null>(null);
  const timersRef = useRef<NodeJS.Timeout[]>([]);

  // Expose triggerIncrement globally for testing
  useEffect(() => {
    (window as any).triggerCoinIncrement = triggerIncrement;
    return () => {
      delete (window as any).triggerCoinIncrement;
    };
  }, []);

  // Listen for external coin balance updates (custom event + storage)
  useEffect(() => {
    const handleCoinBalanceUpdated = (event: any) => {
      try {
        const newBalanceFromEvent = event?.detail?.newBalance;
        const newBalance =
          typeof newBalanceFromEvent === "number"
            ? newBalanceFromEvent
            : typeof window !== "undefined"
            ? parseInt(localStorage.getItem("coinBalance") || `${coins}`)
            : coins;
        setCoins(newBalance);
        setDisplayCoins(newBalance);
        setPhase("done");
        setIsJumping(false);
        setIsNumberPop(false);
        setIsFinalPop(false);
        setIsFinalPopTwo(false);
      } catch {}
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === "coinBalance" && e.newValue != null) {
        const newVal = parseInt(e.newValue || "0");
        setCoins(newVal);
        setDisplayCoins(newVal);
        setPhase("done");
        setIsJumping(false);
        setIsNumberPop(false);
        setIsFinalPop(false);
        setIsFinalPopTwo(false);
      }
    };

    window.addEventListener("coinBalanceUpdated", handleCoinBalanceUpdated as any);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener(
        "coinBalanceUpdated",
        handleCoinBalanceUpdated as any,
      );
      window.removeEventListener("storage", handleStorage);
    };
  }, [coins]);

  function addCoins(amount: number) {
    setCoins((v) => {
      const newValue = v + amount;
      // Save to localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("coinBalance", newValue.toString());
      }
      return newValue;
    });
    if (!audioRef.current)
      audioRef.current = new Audio("/game-bonus-02-294436.mp3");
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(() => {});
  }

  function triggerIncrement(amount: number) {
    // Get current value from localStorage to ensure we have the latest
    const currentValue =
      typeof window !== "undefined"
        ? parseInt(localStorage.getItem("coinBalance") || "0")
        : coins;

    // Update coins state
    addCoins(amount);

    if (animationFrameRef.current)
      cancelAnimationFrame(animationFrameRef.current);
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    // Reset pop states immediately
    setIsJumping(false);
    setIsNumberPop(false);
    setIsFinalPop(false);
    setIsFinalPopTwo(false);

    const startValue = currentValue; // Use the current localStorage value
    const targetValue = startValue + amount;
    let startTime: number | null = null;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;

      // New Accelerated Timeline
      const blastEnd = 300; // Phase 1: 300ms
      const decelEnd = 1000; // Phase 2: 700ms
      const pulseEnd = 1200; // Phase 3: 200ms (2x speed)
      const numberPopStart = 1225; // 25ms gap
      const numberPopEnd = 1300; // Phase 5: 75ms
      const finalPopOneStart = 1300; // Phase 6a: 100ms
      const finalPopOneEnd = 1400;
      const finalPopTwoStart = 1400; // Phase 6b: 100ms
      const finalPopTwoEnd = 1500;
      const restoreEnd = 1800; // Phase 7: 300ms (for transition)

      // Update count based on elapsed time
      if (elapsed < blastEnd) {
        if (phase !== "blast") setPhase("blast");
        const progress = elapsed / blastEnd;
        const incrementAmount = targetValue - startValue;
        setDisplayCoins(
          startValue + Math.floor(incrementAmount * 0.9 * progress)
        );
      } else if (elapsed < decelEnd) {
        if (phase !== "decel") {
          setPhase("decel");
          setIsJumping(true); // FIX: Trigger coin jump with dedicated state
          timersRef.current.push(setTimeout(() => setIsJumping(false), 1350)); // 3 animation loops
        }
        const progress = (elapsed - blastEnd) / (decelEnd - blastEnd);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const incrementAmount = targetValue - startValue;
        setDisplayCoins(
          startValue +
            Math.floor(incrementAmount * 0.9) +
            Math.floor(incrementAmount * 0.05 * easeOut)
        );
      } else if (elapsed < pulseEnd) {
        if (phase !== "pulse") setPhase("pulse");
        const progress = (elapsed - decelEnd) / (pulseEnd - decelEnd);
        const incrementAmount = targetValue - startValue;
        setDisplayCoins(
          startValue +
            Math.floor(incrementAmount * 0.95) +
            Math.floor(incrementAmount * 0.05 * progress)
        );
      } else {
        if (phase !== "done") {
          setPhase("done");
          setDisplayCoins(targetValue);
        }
      }

      // Handle pop animations
      setIsNumberPop(elapsed >= numberPopStart && elapsed < numberPopEnd);
      setIsFinalPop(elapsed >= finalPopOneStart && elapsed < finalPopOneEnd);
      setIsFinalPopTwo(elapsed >= finalPopTwoStart && elapsed < finalPopTwoEnd);

      if (elapsed < restoreEnd) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        // Final cleanup
        animationFrameRef.current = null;
        setPhase("done");
        setDisplayCoins(targetValue);
        setIsJumping(false);
        setIsNumberPop(false);
        setIsFinalPop(false);
        setIsFinalPopTwo(false);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);
  }

  // Calculate animation progress based on the current increment animation
  const getAnimationProgress = () => {
    if (phase === "done") return 1;
    if (phase === "blast") return 0.3;
    if (phase === "decel") return 0.6;
    if (phase === "pulse") return 0.9;
    return 0;
  };

  const animationProgress = getAnimationProgress();

  const getTextColor = () => {
    if (phase === "done") return "rgb(0, 0, 0)";
    if (animationProgress < 0.5) {
      const t = animationProgress * 2;
      return `rgb(${Math.floor(250 * t)}, ${Math.floor(204 * t)}, ${Math.floor(21 * t)})`;
    }
    if (animationProgress < 0.95) return "rgb(250, 204, 21)";
    const t = (animationProgress - 0.95) / 0.05;
    return `rgb(${Math.floor(250 * (1 - t))}, ${Math.floor(204 * (1 - t))}, ${Math.floor(21 * (1 - t))})`;
  };

  const textStyle: React.CSSProperties = {
    color: getTextColor(),
    textShadow: phase === "pulse" ? "0 0 20px rgba(250, 204, 21, 0.8)" : "none",
    transform: `
      scale(${isFinalPop || isFinalPopTwo ? 1.4 : isNumberPop ? 1.25 : phase === "pulse" ? 1.25 : 1})
    `,
    transition:
      "transform 0.2s cubic-bezier(0.68, -0.55, 0.265, 1.55), color 0.1s ease",
  };

  // Determine animation class based on state
  const getAnimationClass = () => {
    if (isFinalPop || isFinalPopTwo) return "coin-animation-final-pop";
    if (isNumberPop) return "coin-animation-number-pop";
    return "";
  };

  return (
    <div
      className={`bg-white rounded-full px-4 py-2 flex items-center gap-2 shadow-sm coin-balance-hover ${getAnimationClass()}`}
    >
      <div
        className={`relative w-5 h-5 shrink-0 ${isJumping ? "animate-coin-jump" : ""}`}
      >
        <Image
          src="/Coin.svg"
          alt="coin"
          width={20}
          height={18}
          className="absolute left-0 top-0"
        />
      </div>
      <div className="relative inline-block select-none">
        <span
          style={textStyle}
          className={`text-sm font-semibold antialiased tabular-nums`}
        >
          {displayCoins}
        </span>
      </div>
    </div>
  );
}

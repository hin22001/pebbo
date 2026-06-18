"use client";

import Image from "next/image";
import { useMemo, useState, useEffect, useRef } from "react";
import gsap from "gsap";

export function StreakCard({
  fireSrc = "/Point_Fire.png",
  coinSrc = "/Coin.svg",
  consecutiveDays = 2,
}: StreakCardProps) {
  const [animatedDay, setAnimatedDay] = useState<number | null>(null);
  const prevConsecutiveDays = useRef(consecutiveDays);
  const fireIconRef = useRef<HTMLImageElement>(null);
  const numberRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Trigger animation when a new day is added
    if (consecutiveDays > prevConsecutiveDays.current) {
      setAnimatedDay(consecutiveDays - 1);
      // Reset animation state after it has played
      const timer = setTimeout(() => setAnimatedDay(null), 1000); // Duration of the longest pop
      return () => clearTimeout(timer);
    }
    prevConsecutiveDays.current = consecutiveDays;
  }, [consecutiveDays]);

  const states = useMemo(
    () => Array.from({ length: 7 }, (_, i) => i < consecutiveDays),
    [consecutiveDays],
  );

  // Hover animation functions
  const handleStreakHover = () => {
    console.log(`🔥 Streak Card Hover - Animating fire and number`);

    // Fire icon pulse with brightness
    if (fireIconRef.current) {
      gsap.to(fireIconRef.current, {
        scale: 1.2,
        filter: "brightness(1.3)",
        duration: 0.4,
        ease: "back.out(2)",
      });
    }

    // Number bounce
    if (numberRef.current) {
      gsap.to(numberRef.current, {
        y: -3,
        duration: 0.3,
        ease: "power2.out",
        yoyo: true,
        repeat: 1,
      });
    }
  };

  const handleStreakLeave = () => {
    console.log(`🔥 Streak Card Leave - Resetting fire and number`);

    // Reset fire icon
    if (fireIconRef.current) {
      gsap.to(fireIconRef.current, {
        scale: 1,
        filter: "brightness(1)",
        duration: 0.3,
        ease: "power2.out",
      });
    }

    // Reset number
    if (numberRef.current) {
      gsap.to(numberRef.current, {
        y: 0,
        duration: 0.3,
        ease: "power2.out",
      });
    }
  };

  return (
    <div
      className="w-[559px] h-[353px] rounded-[30px] bg-white shadow-[0_9px_18px_0_rgba(0,0,0,0.07)] relative overflow-hidden select-none p-6 pt-[210px] cursor-pointer"
      onMouseEnter={handleStreakHover}
      onMouseLeave={handleStreakLeave}
    >
      {/* Big flame and day number */}
      <div
        key={consecutiveDays}
        className={
          "absolute left-[40%] top-1 flex items-center justify-center animate-streak-wiggle"
        }
      >
        <div className="relative flex items-center justify-center">
          <Image
            ref={fireIconRef}
            src={fireSrc}
            alt="streak"
            width={138}
            height={138}
            className="select-none will-change-transform"
            priority
          />
          <div
            ref={numberRef}
            className="absolute text-white leading-none text-[84px] tracking-tight antialiased [font-variant-numeric:tabular-nums]"
            style={{
              WebkitTextStroke: "4px #000",
              textRendering: "optimizeLegibility",
              fontFamily: "'Advercase', serif !important",
              fontWeight: "900",
              letterSpacing: "-0.02em",
              WebkitFontSmoothing: "antialiased",
              MozOsxFontSmoothing: "grayscale",
              top: "60px",
              left: "50%",
              transform: "translateX(-50%)",
            }}
          >
            {consecutiveDays}
          </div>
        </div>
      </div>

      {/* Label under the flame */}
      <p className="day-streak absolute left-1/2 -translate-x-1/2 top-[160px]">
        Day streak!
      </p>
      {/* Fires row */}
      <div className="mx-auto w-[348px] flex justify-center gap-3 sm:gap-4">
        {states.map((active, i) => (
          <StreakCircle
            key={`fire-${i}`}
            isActive={active}
            color="#FF8F00"
            isAnimated={i === animatedDay}
          >
            <Image
              src={fireSrc}
              alt="fire"
              width={24}
              height={24}
              className="pointer-events-none"
            />
          </StreakCircle>
        ))}
      </div>

      {/* Coins row */}
      <div className="mx-auto w-[348px] flex justify-center gap-3 sm:gap-4 mt-4 items-center">
        {states.map((active, i) => (
          <div
            key={`coin-${i}`}
            className="w-10 flex flex-col items-center gap-1"
          >
            <StreakCircle
              isActive={active}
              color="#FF5000"
              isAnimated={i === animatedDay}
            >
              <Image
                src={coinSrc}
                alt="coin"
                width={22}
                height={19.74}
                className="pointer-events-none"
              />
            </StreakCircle>
            <span
              className={
                "text-[14px] font-semibold text-[#ff5000] " +
                (active ? "opacity-100" : "opacity-40")
              }
            >
              +{i === 6 ? 50 : (i + 1) * 5}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StreakCircle({
  isActive,
  color,
  children,
  isAnimated,
}: {
  isActive: boolean;
  color: string;
  children: React.ReactNode;
  isAnimated?: boolean;
}) {
  const animationClasses = isAnimated
    ? "animate-number-pop-effect animate-final-pop"
    : "";

  // Create very subtle neon glow effect (reduced by 10x, 25% transparency, no border)
  const neonGlow = isActive
    ? {
        boxShadow: `0 0 1px ${hexToRgba(color, 0.25)}, 0 0 2px ${hexToRgba(color, 0.25)}, 0 0 3px ${hexToRgba(color, 0.25)}`,
      }
    : {};

  return (
    <div
      className={`size-10 aspect-square rounded-full overflow-hidden shrink-0 flex items-center justify-center transition-all duration-300 ${animationClasses}`}
      style={{
        backgroundColor: hexToRgba(color, 0.2),
        opacity: isActive ? 1 : 0.3,
        ...neonGlow,
      }}
    >
      {children}
    </div>
  );
}

function hexToRgba(hex: string, alpha: number) {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export interface StreakCardProps {
  fireSrc?: string;
  coinSrc?: string;
  consecutiveDays?: number;
}

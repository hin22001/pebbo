"use client";

import Image from "next/image";
import { CoinStack } from "@/components/streak/coin-stack";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface DailyStreakPopupProps {
  consecutiveDays: number;
  onClose?: () => void;
}

export function DailyStreakPopup({
  consecutiveDays,
  onClose,
}: DailyStreakPopupProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [dayToAnimate, setDayToAnimate] = useState<number | null>(null);
  const [day7AnimationClasses, setDay7AnimationClasses] = useState("");
  const [trophyAnimation, setTrophyAnimation] = useState("");

  function close() {
    setIsOpen(false);
    if (onClose) onClose();
  }

  // When the popup opens, determine which *single* day to animate
  useEffect(() => {
    if (isOpen) {
      setDayToAnimate(consecutiveDays);
    } else {
      setDayToAnimate(null); // Reset on close
    }
  }, [isOpen, consecutiveDays]);

  // Trophy animation: wiggle only
  useEffect(() => {
    if (isOpen) {
      // Start with wiggle animation immediately
      setTrophyAnimation("animate-streak-wiggle");
    } else {
      setTrophyAnimation("");
    }
  }, [isOpen]);

  const isDay7Active = consecutiveDays >= 7;

  // Animation sequencer for the Day 07 banner
  useEffect(() => {
    if (isDay7Active && dayToAnimate === 7) {
      const timers: NodeJS.Timeout[] = [];
      // Phase 1: Restore Color
      setDay7AnimationClasses("animate-restore-color");

      // Phase 2: Metal Sheen (133ms - 200ms / 1.5)
      timers.push(
        setTimeout(
          () =>
            setDay7AnimationClasses((prev) => `${prev} animate-metal-sheen`),
          133,
        ),
      );

      // Phase 3: Pop (533ms - 800ms / 1.5)
      timers.push(
        setTimeout(
          () =>
            setDay7AnimationClasses(
              (prev) =>
                `${prev.replace("animate-metal-sheen", "")} animate-card-pop`,
            ),
          533,
        ),
      );

      // Phase 4: Glow (867ms - 1300ms / 1.5)
      timers.push(
        setTimeout(
          () => setDay7AnimationClasses((prev) => `${prev} animate-card-glow`),
          867,
        ),
      );

      // Final Cleanup (1533ms - 2300ms / 1.5)
      timers.push(setTimeout(() => setDay7AnimationClasses(""), 1533));

      return () => timers.forEach(clearTimeout);
    } else {
      setDay7AnimationClasses("");
    }
  }, [isDay7Active, dayToAnimate]);

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={close} />

          <div className="relative w-[358px] h-[538px] rounded-[20px] bg-white shadow-[0_6px_12px_0_rgba(0,0,0,0.07)] overflow-hidden">
            {/* Header area with streak trophy */}
            <div className="absolute left-1/2 -translate-x-1/2 top-8 flex flex-col items-center select-none">
              <Image
                src="/streak trophy.png"
                alt="streak trophy"
                width={80}
                height={80}
                className={`select-none ${trophyAnimation}`}
              />
            </div>

            {/* Title */}
            <p
              className="absolute left-1/2 -translate-x-1/2 top-[140px] text-[#8264ff] text-[18px] leading-[27px] font-medium"
              style={{ fontFamily: "'Advercase', serif !important" }}
            >
              Daily Streak Reward
            </p>

            {/* Grid cards rows */}
            <div className="absolute left-[40px] top-[187px] w-[278px]">
              <div className="grid grid-cols-3 gap-x-2 gap-y-4">
                {Array.from({ length: 6 }, (_, i) => {
                  const day = i + 1;
                  const cardData = [
                    {
                      color: "rgba(165,145,249,0.2)",
                      reward: 5,
                      accent: "text-[#8264ff]",
                    },
                    {
                      color: "rgba(0,205,210,0.2)",
                      reward: 10,
                      accent: "text-[#00cdd2]",
                    },
                    {
                      color: "rgba(255,143,0,0.2)",
                      reward: 15,
                      accent: "text-[#ff8f00]",
                    },
                    {
                      color: "rgba(255,143,0,0.2)",
                      reward: 20,
                      accent: "text-[#ff8f00]",
                    },
                    {
                      color: "rgba(165,145,249,0.2)",
                      reward: 25,
                      accent: "text-[#8264ff]",
                    },
                    {
                      color: "rgba(0,205,210,0.2)",
                      reward: 30,
                      accent: "text-[#00cdd2]",
                    },
                  ][i];

                  const coinCount: 1 | 2 | 3 = day <= 3 ? 1 : day <= 5 ? 2 : 3;
                  const showFireIcon = day === consecutiveDays;
                  const isFireAnimated = dayToAnimate === day;
                  return (
                    <div key={day} className="relative">
                      <Card
                        dayLabel={`Day 0${day}`}
                        isClaimed={consecutiveDays > day}
                        isToBeAnimated={dayToAnimate === day}
                        coinCount={coinCount}
                        showFireIcon={false}
                        {...cardData}
                      />
                      {/* Fire icon outside card wrapper */}
                      {showFireIcon && (
                        <FireIconWithDelay isAnimated={isFireAnimated} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Day 07 banner */}
            <div
              className={`absolute left-[40px] top-[395px] w-[278px] h-[105px] rounded-[16px] shadow-lg overflow-hidden ${!isDay7Active ? "grayscale" : ""} ${day7AnimationClasses}`}
              style={
                {
                  background:
                    "linear-gradient(to bottom, rgba(255,143,0,0.25) 0%, rgba(0,205,210,0.5) 100%)",
                  "--glow-color": hexToRgba("#00cdd2", 0.8),
                } as React.CSSProperties
              }
            >
              <p
                className="absolute left-[22px] top-[6px] text-[#ff5000] text-[12px] font-bold leading-[18px] z-20"
                style={{ fontFamily: "'Advercase', serif !important" }}
              >
                Day 07
              </p>
              <p
                className="absolute right-[12px] top-[4px] text-[#ff5000] text-[26px] font-semibold leading-[36px] z-20"
                style={{ fontFamily: "'Advercase', serif !important" }}
              >
                +50
              </p>
              <div className="absolute left-[16px] top-[6px]">
                <CoinStack count={5} />
              </div>
              <div className="absolute right-[35px] bottom-[12px]">
                <Image
                  src="/Reward Sticker.png"
                  alt="reward"
                  width={85}
                  height={72}
                />
              </div>
            </div>

            {/* Close button */}
            <button
              onClick={close}
              className="absolute top-2 right-2 size-8 rounded-full bg-black/5 hover:bg-black/10 text-black/70"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </>
  );
}

interface CardProps {
  color: string;
  dayLabel: string;
  reward: number;
  accent: string;
  isClaimed: boolean;
  isToBeAnimated: boolean;
  coinCount: 1 | 2 | 3;
  showFireIcon: boolean;
}

function Card({
  color,
  dayLabel,
  reward,
  accent,
  isClaimed,
  isToBeAnimated,
  coinCount,
  showFireIcon,
}: CardProps) {
  const [animationClasses, setAnimationClasses] = useState("");

  useEffect(() => {
    if (isToBeAnimated) {
      const timers: NodeJS.Timeout[] = [];
      // Phase 1: Restore Color (at 0ms)
      setAnimationClasses("animate-restore-color");

      // Phase 2: Metal Sheen (starts at 133ms - 200ms / 1.5)
      timers.push(
        setTimeout(() => {
          setAnimationClasses((prev) => `${prev} animate-metal-sheen`);
        }, 133),
      );

      // Phase 3: Pop (starts at 533ms - 800ms / 1.5)
      timers.push(
        setTimeout(() => {
          setAnimationClasses(
            (prev) =>
              `${prev.replace("animate-metal-sheen", "")} animate-card-pop`,
          );
        }, 533),
      );

      // Phase 4: Glow (starts at 867ms - 1300ms / 1.5)
      timers.push(
        setTimeout(() => {
          setAnimationClasses((prev) => `${prev} animate-card-glow`);
        }, 867),
      );

      // Final Cleanup (at 1533ms - 2300ms / 1.5)
      timers.push(
        setTimeout(() => {
          setAnimationClasses("");
        }, 1533),
      );

      // Cleanup timers on unmount or re-trigger
      return () => timers.forEach(clearTimeout);
    } else {
      setAnimationClasses("");
    }
  }, [isToBeAnimated]);

  const grayscaleClass = !isClaimed && !isToBeAnimated ? "grayscale" : "";
  const accentColor =
    accent.match(/#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})/)?.[0] || "#000";

  return (
    <div
      className={`relative overflow-hidden rounded-[20px] ${grayscaleClass} ${animationClasses} isolate`}
      style={
        { "--glow-color": hexToRgba(accentColor, 0.7) } as React.CSSProperties
      }
    >
      <div
        className="w-[86px] h-[90px] rounded-[20px] shadow-[0_6px_12px_0_rgba(0,0,0,0.03)]"
        style={{ background: color }}
      />
      <p
        className="absolute left-1/2 -translate-x-1/2 top-[8px] text-[#ff5000] text-[12px] leading-[18px] font-bold z-10"
        style={{ fontFamily: "'Advercase', serif !important" }}
      >
        {dayLabel}
      </p>
      <div className="absolute left-1/2 -translate-x-1/2 top-[30px] w-[60px] h-[34px] flex items-center justify-center">
        <div className="w-full h-full rounded-[8px] flex items-center justify-center">
          <CoinStack count={coinCount} />
        </div>
      </div>
      <p
        className={
          "absolute left-1/2 -translate-x-1/2 top-[64px] text-[16px] leading-[24px] font-semibold z-10 " +
          accent
        }
        style={{ fontFamily: "'Advercase', serif !important" }}
      >
        +{reward}
      </p>
    </div>
  );
}

function FireIconWithDelay({ isAnimated }: { isAnimated: boolean }) {
  const [fireAnimationClasses, setFireAnimationClasses] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isAnimated) {
      // Start fire animation during card's glow phase (867ms)
      const timer = setTimeout(() => {
        // Phase 1: Pop out from nowhere (scale from 0 to 1)
        setIsVisible(true);
        setFireAnimationClasses("animate-card-pop");

        // Phase 2: Add wiggle after pop (300ms later)
        const wiggleTimer = setTimeout(() => {
          setFireAnimationClasses("animate-card-pop animate-streak-wiggle");
        }, 300);

        return () => {
          clearTimeout(wiggleTimer);
        };
      }, 867); // Start during card's glow phase

      return () => clearTimeout(timer);
    } else {
      setFireAnimationClasses("");
      setIsVisible(false);
    }
  }, [isAnimated]);

  return (
    <div
      className="absolute -bottom-2 pointer-events-none"
      style={{ right: "-5pt" }}
    >
      <div
        className={fireAnimationClasses}
        style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? "scale(1)" : "scale(0)",
          transition:
            "opacity 0.1s ease-out, transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
        }}
      >
        <Image
          src="/Point_Fire.png"
          alt="fire"
          width={30}
          height={30}
          className="select-none will-change-transform"
          style={{
            width: "30pt",
            height: "30pt",
            objectFit: "contain",
          }}
        />
      </div>
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

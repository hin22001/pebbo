"use client";

import Lottie from "lottie-react";
import potterWalkAnimation from "@/assets/animations/Potter_walk.json";
import { useTimer } from "@/app/contexts/TimerContext";

interface TimerModuleProps {
  size?: number;
  strokeWidth?: number;
  maxMinutes?: number;
}

export function TimerModule({
  size = 120,
  strokeWidth = 8,
  maxMinutes = 20,
}: TimerModuleProps) {
  // Get elapsed seconds from global context
  const { elapsedSeconds } = useTimer();

  // Calculate progress (0 to 1, capped at maxMinutes for the circle)
  const maxSeconds = maxMinutes * 60;
  const progress = Math.min(elapsedSeconds / maxSeconds, 1);

  // Calculate SVG circle properties
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progress * circumference;

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Determine color based on progress
  const getColor = () => {
    if (progress < 0.5) return "#8264ff"; // Purple
    if (progress < 0.75) return "#ff8f00"; // Orange
    if (progress < 1) return "#f03c00"; // Red-orange
    return "#00cdd2"; // Cyan (beyond 20 min)
  };

  return (
    <div
      className="bg-white rounded-[20px] shadow-[0_9px_18px_0_rgba(0,0,0,0.07)] h-full w-full flex flex-col items-center justify-center gap-4"
      style={{ padding: "20px" }}
    >
      {/* Timer sticker image with progress circle */}
      <div
        className="relative inline-flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        {/* Background circle */}
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
          {/* Progress circle */}
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
              transition: "stroke-dashoffset 0.5s ease, stroke 0.3s ease",
            }}
          />
        </svg>

        {/* Timer sticker Lottie animation in the center */}
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <Lottie
            animationData={potterWalkAnimation}
            loop={true}
            style={{ width: size * 0.6, height: size * 0.6 }}
            className="select-none"
          />
        </div>
      </div>

      {/* Time display below image */}
      <div className="flex flex-col items-center gap-2">
        <span
          className="font-bold tabular-nums"
          style={{
            color: getColor(),
            fontSize: size * 0.18,
            lineHeight: 1,
            // Inline style fontFamily gets overriden or dropped with !important in React
            // so we will manually inject a style tag below or rely on the class
          }}
        >
          {formatTime(elapsedSeconds)}
        </span>
        <style
          dangerouslySetInnerHTML={{
            __html: `
          .tabular-nums {
            font-family: 'Advercase', serif !important;
            letter-spacing: 0.07rem;
          }
        `,
          }}
        />

        {/* "20 minutes a day in Pebbo!" text */}
        <p
          className="text-[16px] font-medium text-[#8264ff]"
          style={{ fontFamily: "'Advercase', serif", letterSpacing: "0.07rem" }}
        >
          20 minutes a day in Pebbo!
        </p>
      </div>
    </div>
  );
}

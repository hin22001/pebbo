import { useEffect, useRef, useState } from "react";

export type UseQuestionTimerOptions = {
  /**
   * When true, the timer starts (or continues) counting. When false, the timer
   * pauses and records `timeEnd`.
   */
  running: boolean;
};

export type UseQuestionTimerResult = {
  timeStart: Date | null;
  timeEnd: Date | null;
  startTimer: boolean;
  /**
   * Convenience derived value for total elapsed seconds between
   * `timeStart` and `timeEnd` (or now, if still running).
   */
  elapsedSeconds: number;
};

/**
 * Small utility hook that centralises the timing fields used by
 * `<QuestionTimer />` and the results screen.
 *
 * For now this hook mirrors the existing behaviour in the legacy class and is
 * intentionally side‑effect free outside of its own state, so it can be
 * adopted incrementally.
 */
export function useQuestionTimer(
  options: UseQuestionTimerOptions,
): UseQuestionTimerResult {
  const { running } = options;

  const [timeStart, setTimeStart] = useState<Date | null>(null);
  const [timeEnd, setTimeEnd] = useState<Date | null>(null);
  const [startTimer, setStartTimer] = useState(false);
  const intervalRef = useRef<number | null>(null);

  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    if (running) {
      if (!timeStart) {
        setTimeStart(new Date());
      }
      setStartTimer(true);
      if (intervalRef.current == null) {
        intervalRef.current = window.setInterval(() => {
          setNow(new Date());
        }, 1000);
      }
    } else {
      setStartTimer(false);
      setTimeEnd((prev) => prev ?? new Date());
      if (intervalRef.current != null) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current != null) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
    // We intentionally do not depend on timeStart/timeEnd here to keep the
    // behaviour aligned with the legacy implementation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  let elapsedSeconds = 0;
  if (timeStart) {
    const end = startTimer ? now : timeEnd ?? now;
    elapsedSeconds = Math.max(
      0,
      Math.floor((end.getTime() - timeStart.getTime()) / 1000),
    );
  }

  return {
    timeStart,
    timeEnd,
    startTimer,
    elapsedSeconds,
  };
}


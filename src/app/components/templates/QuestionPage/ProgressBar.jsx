import React, { useEffect, useRef, useState } from "react";
import LinearProgress from "@mui/material/LinearProgress";
import { styled } from "@mui/material/styles";

const BorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: 10,
  borderRadius: 5,
  backgroundColor: "rgba(245, 249, 255, 1)",
  "& .MuiLinearProgress-bar": {
    borderRadius: 5,
    backgroundColor: "rgba(255, 80, 0, 1)",
  }
}));

export default function ProgressBar({ startTime, running, maxDuration = 1200 }) {
  const [percent, setPercent] = useState(0);
  const intervalRef = useRef();

  useEffect(() => {
    if (!running || !startTime) {
      setPercent(0);
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.max((now - new Date(startTime).getTime()) / 1000, 0);
      const percentCalc = Math.min(100, (elapsed / maxDuration) * 100);
      setPercent(percentCalc);
    }, 1000);
    // set percent immediately on mount
    const now = Date.now();
    const elapsed = Math.max((now - new Date(startTime).getTime()) / 1000, 0);
    const percentCalc = Math.min(100, (elapsed / maxDuration) * 100);
    setPercent(percentCalc);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [startTime, running, maxDuration]);

  return <BorderLinearProgress variant="determinate" value={percent} />;
}

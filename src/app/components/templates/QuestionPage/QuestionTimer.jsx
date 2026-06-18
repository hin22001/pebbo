import { Typography } from "@mui/material";
import { useEffect, useState } from "react";

let intervalQuiz = null;

export default function QuestionTimer(props) {
  const [timeSpent, setTimeSpent] = useState(0);
  const [start, setStart] = useState(false);

  const formatTime = (totalSeconds) => {
    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
    const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(
      2,
      "0",
    );
    const seconds = String(totalSeconds % 60).padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  };

  const startTime = () => {
    const start = Date.now();
    intervalQuiz = setInterval(() => {
      const currentTime = Date.now();
      setTimeSpent(Math?.floor((currentTime - start) / 1000));
    }, 1000);
  };

  useEffect(() => {
    if (props?.start) {
      startTime();
    } else {
      clearInterval(intervalQuiz);
    }
  }, [props?.start]);

  return (
    <Typography
      color="#FF5000"
      className={"template-question-page-timer-txt-timer"}
      fontWeight={700}
      sx={{
        fontSize: "3rem",
        fontFamily: "'Advercase', serif !important",
        letterSpacing: "0.07rem",
      }}
      textAlign="center"
    >
      {formatTime(timeSpent)}
    </Typography>
  );
}

import React from "react";
import { Stack, Typography } from "@mui/material";
import { ImageHandler } from "../../elements";
import { locale } from "@/src/app/data/locale";

export default function DashboardTodoSection({
  mainClassName,
  head,
  todoContainerRef,
  todoClick,
  todoRowRefs,
  isTodoChecked,
  quizList,
}) {
  return (
    <Stack
      className={mainClassName + "-flex-item-left2-content1"}
      ref={todoContainerRef}
      style={{ position: "relative" }}
    >
      <Typography
        fontSize={20}
        fontWeight={600}
        sx={{
          fontFamily: "'Advercase', serif !important",
          letterSpacing: "0.07rem",
        }}
      >
        {locale(head?.todoList)}
      </Typography>
      <Stack>
        <Stack
          onClick={() => todoClick("exercise", "/question/exercise")}
          className={mainClassName + "-section2-row2"}
          ref={(el) => (todoRowRefs.current[0] = el)}
        >
          <Stack className={mainClassName + "-section2-row-inner"}>
            <Stack direction="row" alignItems="center">
              <Stack mr={1} alignItems="center" justifyContent="center">
                <ImageHandler
                  src={require("@/images/icon/icon-classroom.svg")}
                  alt="question"
                  className={mainClassName + "-section2-question-ico"}
                  width={40}
                  height={40}
                />
              </Stack>
              <Stack alignItems="center" justifyContent="center">
                <Typography fontWeight={500} fontSize={16}>
                  {locale(head?.doExercise)}
                </Typography>
              </Stack>
            </Stack>
            <Stack direction="column" alignItems="flex-end">
              <ImageHandler
                src={require(
                  `@/images/icon/icon-todo${isTodoChecked("exercise") ? "-ticked" : ""}.png`,
                )}
                alt="question"
                className={mainClassName + "-todo-ico"}
                width={20}
                height={20}
              />
            </Stack>
          </Stack>
        </Stack>
        <Stack
          onClick={() => todoClick("report", "/reports/daily")}
          className={mainClassName + "-section2-row3"}
          ref={(el) => (todoRowRefs.current[1] = el)}
        >
          <Stack className={mainClassName + "-section2-row-inner"}>
            <Stack direction="row" alignItems="center">
              <Stack mr={1} alignItems="center" justifyContent="center">
                <ImageHandler
                  src={require("@/images/icon/icon-report.svg")}
                  alt="question"
                  className={mainClassName + "-section2-question-ico"}
                  width={40}
                  height={40}
                />
              </Stack>
              <Stack alignItems="center" justifyContent="center">
                <Typography fontWeight={500} fontSize={16}>
                  {locale(head?.readDailyReport)}
                </Typography>
              </Stack>
            </Stack>
            <Stack direction="column" alignItems="flex-end">
              <ImageHandler
                src={require(
                  `@/images/icon/icon-todo${isTodoChecked("report") ? "-ticked" : ""}.png`,
                )}
                alt="question"
                className={mainClassName + "-todo-ico"}
                width={20}
                height={20}
              />
            </Stack>
          </Stack>
        </Stack>
        {quizList?.map((val, i) => (
          <Stack
            onClick={() =>
              todoClick(
                `quiz_${val?.quiz_id}`,
                `/classroom/student/detail/quiz?id=${val?.classroom_id}&quiz_id=${val?.quiz_id}`,
              )
            }
            key={i}
            className={mainClassName + "-section2-row"}
            ref={(el) => (todoRowRefs.current[i + 2] = el)}
          >
            <Stack className={mainClassName + "-section2-row-inner"}>
              <Stack direction="row" alignItems="center">
                <Stack mr={1} alignItems="center" justifyContent="center">
                  <ImageHandler
                    src={require("@/images/icon/icon-question-mark.svg")}
                    alt="question"
                    className={mainClassName + "-section2-question-ico"}
                    width={40}
                    height={40}
                  />
                </Stack>
                <Stack alignItems="center" justifyContent="center">
                  <Typography fontWeight={500} fontSize={16}>
                    {val?.quiz_title}
                  </Typography>
                </Stack>
              </Stack>
              <Stack direction="column" alignItems="flex-end">
                <ImageHandler
                  src={require(
                    `@/images/icon/icon-todo${isTodoChecked(`quiz_${val?.quiz_id}`) ? "-ticked" : ""}.png`,
                  )}
                  alt="question"
                  className={mainClassName + "-todo-ico"}
                  width={20}
                  height={20}
                />
              </Stack>
            </Stack>
          </Stack>
        ))}
      </Stack>
    </Stack>
  );
}

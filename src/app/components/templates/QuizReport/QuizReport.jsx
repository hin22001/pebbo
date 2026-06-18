import React, { useEffect, useState } from "react";
import { getDataHead } from "@/src/app/data/head";
import { Card, Skeleton, Stack, Typography } from "@mui/material";
import Chart from "@/modules/chart/Chart";
import TeacherCard from "@/modules/card/TeacherCard";
import { locale } from "@/src/app/data/locale";
import { ContentLayout } from "@/layouts/ContentLayout";

import { ImageHandler, TabTeacher } from "../../elements";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import TeacherAPI from "@/src/app/data/api/TeacherAPI";

export default function QuizReport() {
  const [tabPerformance, setTabPerformance] = useState(1);
  const [renderGraph, setRenderGraph] = useState(true);
  const [head, setHead] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [typeDate, setTypeDate] = useState(1);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  // Dashboard (quiz list)
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedQuizId, setSelectedQuizId] = useState(null);

  // Per-quiz data
  const [perf, setPerf] = useState(null);
  const [perfLoading, setPerfLoading] = useState(false);
  const [diff, setDiff] = useState(null);
  const [diffLoading, setDiffLoading] = useState(false);
  const [weekday, setWeekday] = useState(null);
  const [weekdayLoading, setWeekdayLoading] = useState(false);

  const mainClassName = "quiz-report-page";

  // Fetch quiz dashboard on mount
  useEffect(() => {
    const head = getDataHead({ name: "headQuizReport" });
    setHead(head);

    let cancelled = false;
    (async () => {
      try {
        const res = await TeacherAPI.getQuizDashboard();
        if (!cancelled) setDashboard(res ?? null);
      } catch {
        if (!cancelled) setDashboard(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const recentQuizzes = Array.isArray(dashboard?.recent_quizzes)
    ? dashboard.recent_quizzes
    : [];

  // Auto-select first quiz once list arrives
  useEffect(() => {
    if (selectedQuizId == null && recentQuizzes.length > 0) {
      setSelectedQuizId(recentQuizzes[0].quiz_id);
    }
  }, [recentQuizzes, selectedQuizId]);

  // Fetch perf + difficulty + weekday in parallel when quiz selection changes
  useEffect(() => {
    if (selectedQuizId == null) return;
    let cancelled = false;
    setPerfLoading(true); setDiffLoading(true); setWeekdayLoading(true);
    (async () => {
      try {
        const [p, d, w] = await Promise.all([
          TeacherAPI.getQuizPerformance({ quiz_id: selectedQuizId }).catch(() => null),
          TeacherAPI.getQuizDifficulty({ quiz_id: selectedQuizId }).catch(() => null),
          TeacherAPI.getAccuracyByWeekday({ quiz_id: selectedQuizId }).catch(() => null),
        ]);
        if (cancelled) return;
        setPerf(p); setDiff(d); setWeekday(w);
      } finally {
        if (!cancelled) {
          setPerfLoading(false);
          setDiffLoading(false);
          setWeekdayLoading(false);
        }
      }
    })();
    return () => { cancelled = true; };
  }, [selectedQuizId]);

  // Date-range filter — startDate/endDate are dayjs objects from the DatePicker
  const filteredQuizzes = recentQuizzes.filter((q) => {
    if (!q.created_date) return true;
    const d = dayjs(q.created_date);
    if (startDate && d.isBefore(dayjs(startDate).startOf("day"))) return false;
    if (endDate && d.isAfter(dayjs(endDate).endOf("day"))) return false;
    return true;
  });

  // Derive selected quiz object for the preview card header
  const selectedQuiz = recentQuizzes.find((q) => q.quiz_id === selectedQuizId) ?? null;

  // Best / worst category from category_analysis (average_accuracy is 0..100)
  const sortedCategories = Array.isArray(diff?.category_analysis)
    ? [...diff.category_analysis].sort((a, b) => b.average_accuracy - a.average_accuracy)
    : [];
  const bestCategory = sortedCategories[0]?.category ?? "—";
  const worstCategory = sortedCategories[sortedCategories.length - 1]?.category ?? "—";

  // Headline KPIs
  const avgResponses = perf?.total_responses ?? "—";
  // average_time_per_question is raw seconds from the DB
  const avgTimeRaw = perf?.average_time_per_question;
  const avgTimeDisplay =
    avgTimeRaw != null
      ? `${Math.round(avgTimeRaw * 10) / 10} s`
      : "—";

  // Student leaderboard — sorted by accuracy_rate desc (already 0..100)
  const studentList = Array.isArray(perf?.performance_by_student)
    ? [...perf.performance_by_student]
        .sort((a, b) => b.accuracy_rate - a.accuracy_rate)
        .slice(0, 8)
    : [];

  // Weekday accuracy chart (accuracy_rate 0..1 from weekday endpoint — multiply by 100)
  const weekdayItems = Array.isArray(weekday?.weekdays) ? weekday.weekdays : [];
  const optionDailyAccuracy = {
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: weekdayItems.map((w) => w.label),
    },
    yAxis: { type: "value", min: 0, max: 100 },
    symbolSize: 5,
    series: [
      {
        // accuracy is 0..1 from this endpoint
        data: weekdayItems.map((w) => Math.round(w.average_accuracy * 100)),
        type: "line",
        areaStyle: {
          color: "#040ACF99",
          borderColor: "#040ACF99",
          borderWidth: 2,
        },
        itemStyle: {
          color: "#040ACF99",
          borderColor: "#040ACF99",
          backgroundColor: "#040ACF99",
          borderWidth: 2,
        },
      },
    ],
  };

  // Difficulty accuracy chart (accuracy_rate is 0..100 from difficulty endpoint — do NOT re-multiply)
  const difficultyItems = Array.isArray(diff?.difficulty_analysis)
    ? diff.difficulty_analysis
    : [];
  const optionAvgAccuracy = {
    title: {
      text: locale(head?.section1?.tab3?.cardTitle),
      left: "center",
    },
    tooltip: { trigger: "item" },
    legend: { orient: "vertical", left: "left" },
    series: [
      {
        name: "",
        type: "pie",
        radius: "70%",
        data: difficultyItems.map((d, idx) => {
          const colors = [
            "#3D7EF8B2",
            "#3D7EF880",
            "#3D7EF81A",
            "#3D7EF84D",
            "#3D7EF8E5",
          ];
          return {
            value: Math.round(d.accuracy_rate),
            name: `Lv. ${d.difficulty_level}`,
            itemStyle: { color: colors[idx % colors.length] },
          };
        }),
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.5)",
          },
        },
      },
    ],
  };

  const switchPerformanceTab = (id) => {
    setTabPerformance(id);
    setRenderGraph(false);
    setTimeout(() => { setRenderGraph(true); }, 1);
  };

  const handleClose = () => { setIsOpen(false); };

  const handleDateChange = (date) => {
    if (typeDate === 1) setStartDate(date);
    else setEndDate(date);
    handleClose();
  };

  const handleOpen = (type) => {
    setTypeDate(type);
    setIsOpen(true);
  };

  return (
    <>
      <ContentLayout title="" hideTitle={true}>
        <TeacherCard>
          <Stack>
            <Card className={mainClassName + "-card"}>
              <Typography className={mainClassName + "-title"}>
                {locale(head?.header?.title)}
              </Typography>

              {/* Date-range filter */}
              <Stack mt={2} alignItems="center">
                <Stack
                  width="50%"
                  direction="row"
                  justifyContent="center"
                  alignItems="center"
                >
                  <ImageHandler
                    src={require("@/images/icon/icon-search.svg")}
                    alt="ico-search"
                    className={mainClassName + "-ico-search"}
                  />
                  <Stack ml={1}>
                    <Stack
                      zIndex={1}
                      direction="row"
                      backgroundColor="#FFF"
                      width="275px"
                      alignItems="center"
                    >
                      <Stack className={mainClassName + "-search-box-border-wrapper"}>
                        <Stack className={mainClassName + "-search-box-border"}>
                          <Stack
                            onClick={() => handleOpen(1)}
                            className={mainClassName + "-search-box"}
                          >
                            <Typography
                              className="cursor-pointer"
                              cursor="pointer"
                              fontSize={16}
                              fontWeight={500}
                              color="#8264FF"
                            >
                              {startDate
                                ? dayjs(startDate).format("DD MMM YY")
                                : locale(head?.header?.startDate)}
                            </Typography>
                            <ImageHandler
                              src={require("@/images/icon/icon-arrow-down-colored.svg")}
                              alt="ico-arrow-down=colored"
                              className={mainClassName + "-ico-search"}
                            />
                          </Stack>
                        </Stack>
                      </Stack>
                      <Stack zIndex={1}>
                        <Typography fontSize={16} fontWeight={500} color="#8264FF">
                          &nbsp;-&nbsp;
                        </Typography>
                      </Stack>
                      <Stack className={mainClassName + "-search-box-border-wrapper"}>
                        <Stack className={mainClassName + "-search-box-border"}>
                          <Stack
                            onClick={() => handleOpen(2)}
                            className={mainClassName + "-search-box"}
                          >
                            <Typography
                              className="cursor-pointer"
                              fontSize={16}
                              fontWeight={500}
                              mr={2}
                              color="#8264FF"
                            >
                              {endDate
                                ? dayjs(endDate).format("DD MMM YY")
                                : locale(head?.header?.endDate)}
                            </Typography>
                            <ImageHandler
                              src={require("@/images/icon/icon-arrow-down-colored.svg")}
                              alt="ico-arrow-down=colored"
                              className={mainClassName + "-ico-search"}
                            />
                          </Stack>
                        </Stack>
                      </Stack>
                    </Stack>
                    <Stack zIndex={0} mt={-7} backgroundColor="#FFF">
                      <DatePicker
                        value={typeDate === 1 ? startDate : endDate}
                        onChange={handleDateChange}
                        open={isOpen}
                        onClose={handleClose}
                        height="1px"
                        style={{
                          height: "1px",
                          marginTop: "-8px",
                          visibility: "hidden",
                        }}
                      />
                    </Stack>
                  </Stack>
                </Stack>
              </Stack>

              {/* Quiz list */}
              <Stack mt={2} className={mainClassName + "-quiz-list-wrapper"}>
                <Stack className={mainClassName + "-quiz-list"}>
                  {loading ? (
                    // Skeleton rows while dashboard loads
                    [0, 1, 2, 3, 4].map((i) => (
                      <Skeleton key={i} variant="rounded" height={56} sx={{ mb: 1 }} />
                    ))
                  ) : filteredQuizzes.length === 0 ? (
                    <Typography color="#999" textAlign="center" p={2}>
                      No quizzes in this range.
                    </Typography>
                  ) : (
                    filteredQuizzes.map((q) => (
                      <Stack
                        key={q.quiz_id}
                        onClick={() => setSelectedQuizId(q.quiz_id)}
                        className={
                          mainClassName +
                          `-quiz-card-${selectedQuizId !== q.quiz_id ? "in" : ""}active`
                        }
                      >
                        <Typography
                          className={
                            mainClassName +
                            `-quiz-card-${selectedQuizId !== q.quiz_id ? "in" : ""}active-text`
                          }
                        >
                          {q.created_date
                            ? dayjs(q.created_date).format("DD-MM-YYYY")
                            : ""}
                        </Typography>
                        <Typography
                          className={
                            mainClassName +
                            `-quiz-card-${selectedQuizId !== q.quiz_id ? "in" : ""}active-text`
                          }
                        >
                          {q.quiz_name}
                        </Typography>
                      </Stack>
                    ))
                  )}
                </Stack>
              </Stack>

              {/* Per-quiz preview card */}
              <Card className={mainClassName + "-card"}>
                <Typography
                  fontSize={20}
                  fontWeight={700}
                  color="#565656"
                  textAlign="center"
                >
                  {selectedQuiz
                    ? `${selectedQuiz.created_date ? dayjs(selectedQuiz.created_date).format("DD-MM-YYYY") + " " : ""}${selectedQuiz.quiz_name ?? ""}`
                    : "—"}
                </Typography>

                {perfLoading ? (
                  <Skeleton variant="rounded" height={140} sx={{ mt: 2 }} />
                ) : selectedQuizId != null && perf == null ? (
                  <Typography color="#999" textAlign="center" p={2}>
                    No student data for this quiz yet.
                  </Typography>
                ) : (
                  <Stack width="100%" alignItems="center" pt={2} pb={2}>
                    <Stack direction="row" width="90%" justifyContent="space-between" mt={2}>
                      <Typography fontSize={14} fontWeight={300} color="#565656">
                        {locale(head?.header?.averageNoQ)}
                      </Typography>
                      <Typography fontSize={14} fontWeight={700} color="#565656">
                        {avgResponses} {locale(head?.header?.perPx)} (↑)
                      </Typography>
                    </Stack>
                    <Stack direction="row" width="90%" justifyContent="space-between" mt={2}>
                      <Typography fontSize={14} fontWeight={300} color="#565656">
                        {locale(head?.header?.averageTimeQ)}
                      </Typography>
                      <Typography fontSize={14} fontWeight={700} color="#565656">
                        {avgTimeDisplay} (↓)
                      </Typography>
                    </Stack>
                    <Stack direction="row" width="90%" justifyContent="space-between" mt={2}>
                      <Typography fontSize={14} fontWeight={300} color="#565656">
                        {locale(head?.header?.bestCategory)}
                      </Typography>
                      <Typography fontSize={14} fontWeight={700} color="#565656">
                        {bestCategory}
                      </Typography>
                    </Stack>
                    <Stack direction="row" width="90%" justifyContent="space-between" mt={2}>
                      <Typography fontSize={14} fontWeight={300} color="#565656">
                        {locale(head?.header?.worstCategory)}
                      </Typography>
                      <Typography fontSize={14} fontWeight={700} color="#565656">
                        {worstCategory}
                      </Typography>
                    </Stack>
                  </Stack>
                )}
              </Card>

              {/* Student leaderboard */}
              <Stack alignItems="center" mt={5} mb={5}>
                <Typography
                  fontSize={16}
                  fontWeight={600}
                  textAlign="center"
                  color="#565656"
                >
                  {locale(head?.section2?.title)}
                </Typography>

                <Stack width="100%" pt={5} pb={2} alignItems="center">
                  <Typography color="#565656" mb={1} fontWeight={700} fontSize={14}>
                    {locale(head?.header?.subtitle)}
                  </Typography>
                  <Stack className={mainClassName + "-card-content-scroll"}>
                    {perfLoading ? (
                      <Skeleton variant="rounded" height={120} sx={{ width: "70%" }} />
                    ) : studentList.length === 0 ? (
                      <Typography color="#999" textAlign="center" p={2}>
                        No student data for this quiz yet.
                      </Typography>
                    ) : (
                      studentList.map((s, i) => (
                        <Stack key={s.student_id ?? i} width="70%" mt={2} mb={2}>
                          <Stack
                            mt={4}
                            direction="row"
                            justifyContent="center"
                            alignItems="center"
                          >
                            <ImageHandler
                              src={require("@/images/icon/icon-wrong.svg")}
                              alt="ico-wrong"
                              className={mainClassName + "-ico-wrong"}
                            />
                            <Stack mt="-20px">
                              {i % 2 === 0 ? (
                                <ImageHandler
                                  src={require("@/images/icon/icon-student-1.svg")}
                                  alt="ico-student"
                                  className={mainClassName + "-ico-student"}
                                />
                              ) : (
                                <ImageHandler
                                  src={require("@/images/icon/icon-student-2.svg")}
                                  alt="ico-student"
                                  className={mainClassName + "-ico-student"}
                                />
                              )}
                              <Typography
                                zIndex={1}
                                fontSize={14}
                                fontWeight={600}
                                color="#fff"
                                textAlign="center"
                                mt="-40px"
                              >
                                {s.student_name}
                              </Typography>
                            </Stack>
                          </Stack>
                        </Stack>
                      ))
                    )}
                  </Stack>
                </Stack>
              </Stack>
            </Card>

            {/* Chart tabs */}
            <TabTeacher
              switchTab={switchPerformanceTab}
              tabValue={tabPerformance}
              tabList={[
                locale(head?.section1?.tab1?.cardTitle),
                locale(head?.section1?.tab3?.title),
              ]}
            />
            <Card className={mainClassName + "-card"}>
              {tabPerformance === 1 ? (
                <Stack p={2}>
                  <Typography fontSize={14} fontWeight={600} textAlign="center">
                    {locale(head?.section1?.tab1?.cardTitle)}
                  </Typography>
                  <Typography mb={-7} mt={4} fontSize={10} fontWeight={300}>
                    {locale(head?.section1?.tab1?.cardSubTitle)}
                  </Typography>
                  <Stack ml={-5}>
                    {weekdayLoading ? (
                      <Skeleton variant="rounded" height={400} />
                    ) : renderGraph && (
                      <Chart
                        option={optionDailyAccuracy}
                        disableStyleCard={true}
                        height={400}
                        onEvents={null}
                      />
                    )}
                  </Stack>
                </Stack>
              ) : (
                <Stack p={2}>
                  {diffLoading ? (
                    <Skeleton variant="rounded" height={400} />
                  ) : renderGraph && (
                    <Chart
                      option={optionAvgAccuracy}
                      disableStyleCard={true}
                      height={400}
                      onEvents={null}
                    />
                  )}
                </Stack>
              )}
            </Card>
          </Stack>
        </TeacherCard>
      </ContentLayout>
    </>
  );
}

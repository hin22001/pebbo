import React, { useEffect, useState } from "react";
import { getDataHead } from "@/src/app/data/head";
import {
  Card,
  MenuItem,
  Select,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import Chart from "@/modules/chart/Chart";
import TeacherCard from "@/modules/card/TeacherCard";
import { Auth } from "@/src/app/data/local";
import { locale } from "@/src/app/data/locale";
import { ContentLayout } from "@/layouts/ContentLayout";
import TeacherAPI from "@/src/app/data/api/TeacherAPI";

import { ImageHandler, TabTeacher } from "../../elements";

export default function ClassReport() {
  const [tabPerformance, setTabPerformance] = useState(1);
  const [tabStudent, setTabStudent] = useState(1);
  const [renderGraph, setRenderGraph] = useState(true);
  const [head, setHead] = useState(null);

  // Real data state
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedQuizId, setSelectedQuizId] = useState(null);
  const [quizPerformance, setQuizPerformance] = useState(null);
  const [perfLoading, setPerfLoading] = useState(false);

  const mainClassName = "class-report-page";

  const optionPerformanceCategory = {
    xAxis: {
      type: "category",
      data: [
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "10",
        "11",
        "12",
        "13",
        "14",
        "15",
        "16",
        "17",
        "18",
        "19",
        "20",
      ],
    },
    yAxis: {
      type: "value",
    },
    series: [
      {
        data: [
          45, 55, 75, 15, 78, 77, 68, 69, 80, 30, 77, 41, 85, 23, 65, 77, 30,
          80, 35, 45, 10,
        ],
        type: "line",
        lineStyle: {
          color: "#3D7EF899",
          width: 2,
        },
        symbolSize: 8,
        itemStyle: {
          color: "#3D7EF899",
          borderColor: "#3D7EF899",
          borderWidth: 2,
        },
      },
    ],
  };

  const optionDailyAccuracy = {
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: ["S", "M", "T", "W", "T", "F", "S"],
    },
    yAxis: {
      type: "value",
    },
    symbolSize: 5,
    series: [
      {
        data: [82, 93, 90, 93, 98, 80, 75],
        type: "line",
        areaStyle: {
          color: "rgba(147, 177, 245)",
          borderColor: "rgba(105, 146, 242)",
          borderWidth: 2,
        },
        itemStyle: {
          color: "rgba(147, 177, 245)",
          borderColor: "rgba(105, 146, 242)",
          backgroundColor: "rgba(105, 146, 242)",
          borderWidth: 2,
        },
      },
      {
        data: [72, 83, 80, 83, 88, 70, 65],
        type: "line",
        areaStyle: {
          color: "rgba(105, 146, 242)",
          borderColor: "rgba(105, 146, 242)",
          borderWidth: 2,
        },
        itemStyle: {
          color: "rgba(105, 146, 242)",
          borderColor: "rgba(105, 146, 242)",
          backgroundColor: "rgba(105, 146, 242)",
          borderWidth: 2,
        },
      },
    ],
  };

  const optionAvgAccuracy = {
    title: {
      text: locale(head?.section1?.tab3?.cardTitle),
      left: "center",
    },
    tooltip: {
      trigger: "item",
    },
    legend: {
      orient: "vertical",
      left: "left",
    },
    series: [
      {
        name: "",
        type: "pie",
        radius: "70%",
        data: [
          { value: 79, name: "Lv. 1", itemStyle: { color: "#3D7EF8B2" } },
          { value: 89, name: "LV. 2", itemStyle: { color: "#3D7EF880" } },
          { value: 59, name: "LV. 3", itemStyle: { color: "#3D7EF81A" } },
          { value: 62, name: "LV. 4", itemStyle: { color: "#3D7EF84D" } },
          { value: 6, name: "LV. 5", itemStyle: { color: "#3D7EF8E5" } },
        ],
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
    setTimeout(() => {
      setRenderGraph(true);
    }, 1);
  };

  useEffect(() => {
    const head = getDataHead({
      name: "headClassReport",
    });
    setHead(head);
  }, []);

  // Fetch quiz dashboard on mount
  useEffect(() => {
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
    return () => {
      cancelled = true;
    };
  }, []);

  // Derived data — defend against malformed payloads
  const recentQuizzes = Array.isArray(dashboard?.recent_quizzes)
    ? dashboard.recent_quizzes
    : [];

  // Auto-select the first quiz once dashboard loads
  useEffect(() => {
    if (selectedQuizId == null && recentQuizzes.length > 0) {
      setSelectedQuizId(recentQuizzes[0].quiz_id);
    }
  }, [recentQuizzes, selectedQuizId]);

  // Fetch per-quiz student performance whenever selected quiz changes
  useEffect(() => {
    if (!selectedQuizId) return;
    let cancelled = false;
    setPerfLoading(true);
    (async () => {
      try {
        const res = await TeacherAPI.getQuizPerformance({
          quiz_id: selectedQuizId,
        });
        if (!cancelled) setQuizPerformance(res ?? null);
      } catch {
        if (!cancelled) setQuizPerformance(null);
      } finally {
        if (!cancelled) setPerfLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedQuizId]);

  // Sort students by accuracy; filter to those who attempted at least 1 question
  const allStudents = Array.isArray(
    quizPerformance?.performance_by_student
  )
    ? quizPerformance.performance_by_student.filter(
        (s) => s.questions_attempted > 0
      )
    : [];

  const sortedDesc = [...allStudents].sort(
    (a, b) =>
      b.questions_correct / b.questions_attempted -
      a.questions_correct / a.questions_attempted
  );
  // Top 5 performers (for tab 2 — individual student view top group)
  const topStudents = sortedDesc.slice(0, 5).map((s) => s.student_name);
  // Bottom 5 (needs help)
  const bottomStudents = [...sortedDesc]
    .reverse()
    .slice(0, 5)
    .map((s) => s.student_name);

  // Build the two-group structure that tab 2 ("Individual") expects
  const individualStudentData =
    topStudents.length > 0 || bottomStudents.length > 0
      ? [
          {
            channel: "Best Performance Students (Top 10%)",
            student: topStudents,
          },
          {
            channel: "Students Need More Help (Bottom 10%)",
            student: bottomStudents,
          },
        ]
      : [];

  // Helper: format a date string gracefully
  const formatDate = (d) => {
    if (!d) return "";
    try {
      return new Date(d).toLocaleDateString();
    } catch {
      return d;
    }
  };

  // Find the selected quiz name for the picker label
  const selectedQuizName =
    recentQuizzes.find((q) => q.quiz_id === selectedQuizId)?.quiz_name ?? "";

  // Headline-card derived constants (hoisted from render IIFE)
  const categoryPerf = Array.isArray(dashboard?.category_performance)
    ? dashboard.category_performance
    : [];
  const bestCategory = categoryPerf.length > 0 ? categoryPerf[0].category : null;
  const worstCategory = categoryPerf.length > 0 ? categoryPerf[categoryPerf.length - 1].category : null;
  const avgAccuracy =
    dashboard?.overview_stats?.average_quiz_accuracy != null
      ? Math.round(dashboard.overview_stats.average_quiz_accuracy * 100) + "%"
      : null;

  return (
    <ContentLayout title="" hideTitle={true}>
      <TeacherCard>
        <Stack>
          <Card className={mainClassName + "-card"}>
            <Typography className={mainClassName + "-title"}>
              {locale(head?.header?.title)}
            </Typography>
            <Stack width="100%" alignItems="center" pt={2} pb={2}>
                  <Stack direction="row" width="90%" justifyContent="space-between">
                    <Typography fontSize={24} fontWeight={700}>
                      Teacher
                    </Typography>
                    <Typography fontSize={24} fontWeight={700}>
                      {loading ? (
                        <Skeleton variant="text" width={80} />
                      ) : (
                        dashboard?.teacher_name ?? "—"
                      )}
                    </Typography>
                  </Stack>

                  <Stack
                    direction="row"
                    width="90%"
                    justifyContent="space-between"
                    mt={2}
                  >
                    <Typography fontSize={14} fontWeight={300} color="#565656">
                      {locale(head?.header?.studentNumbers)}
                    </Typography>
                    <Typography fontSize={14} fontWeight={700} color="#565656">
                      {loading ? (
                        <Skeleton variant="text" width={40} />
                      ) : (
                        dashboard?.overview_stats?.total_students_participated ?? "—"
                      )}
                    </Typography>
                  </Stack>
                  <Stack
                    direction="row"
                    width="90%"
                    justifyContent="space-between"
                    mt={1}
                  >
                    <Typography fontSize={14} fontWeight={300} color="#565656">
                      Total quizzes
                    </Typography>
                    <Typography fontSize={14} fontWeight={700} color="#565656">
                      {loading ? (
                        <Skeleton variant="text" width={40} />
                      ) : (
                        dashboard?.overview_stats?.total_quizzes ?? "—"
                      )}
                    </Typography>
                  </Stack>
                  <Stack
                    direction="row"
                    width="90%"
                    justifyContent="space-between"
                    mt={1}
                  >
                    <Typography fontSize={14} fontWeight={300} color="#565656">
                      Avg accuracy
                    </Typography>
                    <Typography fontSize={14} fontWeight={700} color="#565656">
                      {loading ? (
                        <Skeleton variant="text" width={40} />
                      ) : (
                        avgAccuracy ?? "—"
                      )}
                    </Typography>
                  </Stack>

                  <Stack direction="row" width="90%" mt={2}>
                    <Typography fontSize={14} fontWeight={700} color="#565656">
                      {locale(head?.header?.overallPerformanceReview)}
                    </Typography>
                  </Stack>
                  <Stack
                    direction="row"
                    width="90%"
                    justifyContent="space-between"
                    mt={2}
                  >
                    <Typography fontSize={14} fontWeight={300} color="#565656">
                      {locale(head?.header?.bestCategory)}
                    </Typography>
                    <Typography fontSize={14} fontWeight={700} color="#565656">
                      {loading ? (
                        <Skeleton variant="text" width={40} />
                      ) : (
                        bestCategory ?? "—"
                      )}
                    </Typography>
                  </Stack>
                  <Stack
                    direction="row"
                    width="90%"
                    justifyContent="space-between"
                    mt={1}
                  >
                    <Typography fontSize={14} fontWeight={300} color="#565656">
                      {locale(head?.header?.worstCategory)}
                    </Typography>
                    <Typography fontSize={14} fontWeight={700} color="#565656">
                      {loading ? (
                        <Skeleton variant="text" width={40} />
                      ) : (
                        worstCategory ?? "—"
                      )}
                    </Typography>
                  </Stack>
                </Stack>
          </Card>

          <TabTeacher
            switchTab={switchPerformanceTab}
            tabValue={tabPerformance}
            tabList={[
              locale(head?.section1?.tab1?.title),
              locale(head?.section1?.tab2?.title),
              locale(head?.section1?.tab3?.title),
            ]}
          />
          <Card className={mainClassName + "-card"}>
            {tabPerformance === 1 ? (
              <Stack p={2}>
                <Typography fontSize={14} fontWeight={600}>
                  {locale(head?.section1?.tab1?.cardTitle)}
                </Typography>
                <Typography mb={-7} mt={2} fontSize={10} fontWeight={300}>
                  {locale(head?.section1?.tab1?.cardSubTitle)}
                </Typography>
                <Stack ml={-5}>
                  {renderGraph && (
                    <Chart
                      option={optionPerformanceCategory}
                      disableStyleCard={true}
                      height={400}
                      onEvents={null}
                    />
                  )}
                </Stack>
              </Stack>
            ) : tabPerformance === 2 ? (
              <Stack p={2}>
                <Typography fontSize={14} fontWeight={600}>
                  {locale(head?.section1?.tab2?.cardTitle)}
                </Typography>
                <Typography mb={-7} mt={2} fontSize={10} fontWeight={300}>
                  {locale(head?.section1?.tab2?.cardSubTitle)}
                </Typography>
                <Stack ml={-5}>
                  {renderGraph && (
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
                <Stack>
                  {renderGraph && (
                    <Chart
                      option={optionAvgAccuracy}
                      disableStyleCard={true}
                      height={400}
                      onEvents={null}
                    />
                  )}
                </Stack>
              </Stack>
            )}
          </Card>

          {/* Section 2: Quiz performance list from getQuizDashboard().recent_quizzes */}
          <Card className={mainClassName + "-card"}>
            <Stack alignItems="center" pt={2}>
              <Typography color="#565656" mb={1} fontWeight={700} fontSize={14}>
                {locale(head?.section2?.title)}
              </Typography>
              <Stack className={mainClassName + "-card-content-scroll"}>
                {loading ? (
                  // Skeleton rows while loading
                  [0, 1, 2, 3].map((i) => (
                    <Stack key={i} width="80%" mt={2} mb={2}>
                      <Skeleton variant="rounded" height={56} />
                    </Stack>
                  ))
                ) : recentQuizzes.length === 0 ? (
                  <Typography
                    color="#99a0ab"
                    fontSize={14}
                    mt={2}
                    mb={2}
                    textAlign="center"
                  >
                    No quizzes assigned yet.
                  </Typography>
                ) : (
                  recentQuizzes.map((val, i) => (
                    <Stack key={val.quiz_id ?? i} width="80%" mt={2} mb={2}>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography
                          color="#565656"
                          fontSize={14}
                          fontWeight={400}
                          className="underline"
                        >
                          {formatDate(val.created_date)}
                        </Typography>
                        <Stack direction="row">
                          <Typography
                            fontSize={14}
                            color="#565656"
                            fontWeight={400}
                          >
                            {locale(head?.section2?.avgScore)}&nbsp;
                          </Typography>
                          <Typography
                            fontSize={14}
                            color="#565656"
                            fontWeight={700}
                          >
                            {val.average_accuracy != null ? Math.round(val.average_accuracy * 100) + "/100" : "—"}
                          </Typography>
                        </Stack>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography
                          color="#565656"
                          fontSize={14}
                          fontWeight={400}
                        >
                          ({val.quiz_name})
                        </Typography>
                        <Stack direction="row">
                          <Typography
                            fontSize={14}
                            color="#565656"
                            fontWeight={400}
                          >
                            {locale(head?.section2?.noQ)}&nbsp;
                          </Typography>
                          <Typography
                            fontSize={14}
                            color="#565656"
                            fontWeight={700}
                          >
                            {val.total_questions}
                          </Typography>
                        </Stack>
                      </Stack>
                    </Stack>
                  ))
                )}
              </Stack>
            </Stack>
          </Card>

          <TabTeacher
            switchTab={setTabStudent}
            tabValue={tabStudent}
            tabList={[
              locale(head?.section3?.tab1?.title),
              locale(head?.section3?.tab2?.title),
            ]}
          />

          {/* Quiz picker — MUI Select above student cards so both tabs share the same context */}
          {recentQuizzes.length > 0 && (
            <Stack px={2} pt={1} pb={0}>
              <Select
                size="small"
                value={selectedQuizId ?? ""}
                onChange={(e) => setSelectedQuizId(e.target.value)}
                displayEmpty
                sx={{ fontSize: 13 }}
              >
                {recentQuizzes.map((q) => (
                  <MenuItem key={q.quiz_id} value={q.quiz_id}>
                    {q.quiz_name}
                  </MenuItem>
                ))}
              </Select>
            </Stack>
          )}

          <Card className={mainClassName + "-card"}>
            {tabStudent === 1 ? (
              // Tab 1: Strugglers — students who answered the fewest questions correctly
              <Stack pt={2} pb={2} alignItems="center">
                <Typography
                  color="#565656"
                  mb={1}
                  fontWeight={700}
                  fontSize={14}
                >
                  {locale(head?.section3?.tab1?.cardTitle)}
                </Typography>
                <Stack className={mainClassName + "-card-content-scroll"}>
                  {perfLoading ? (
                    [0, 1, 2].map((i) => (
                      <Stack key={i} width="50%" mt={2} mb={2}>
                        <Skeleton variant="rounded" height={56} />
                      </Stack>
                    ))
                  ) : bottomStudents.length === 0 ? (
                    <Typography
                      color="#99a0ab"
                      fontSize={14}
                      mt={2}
                      mb={2}
                      textAlign="center"
                    >
                      No student data for this quiz yet.
                    </Typography>
                  ) : (
                    <Stack width="50%" mt={2} mb={2}>
                      <Typography
                        textAlign="center"
                        fontWeight={400}
                        fontSize={14}
                        color="#565656"
                      >
                        {selectedQuizName}
                      </Typography>
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
                        {bottomStudents.map((name, i) => (
                          <Stack key={i} mt="-20px">
                            {i % 2 === 0 ? (
                              <ImageHandler
                                src={require(
                                  "@/images/icon/icon-student-1.svg"
                                )}
                                alt="ico-student"
                                className={mainClassName + "-ico-student"}
                              />
                            ) : (
                              <ImageHandler
                                src={require(
                                  "@/images/icon/icon-student-2.svg"
                                )}
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
                              {name}
                            </Typography>
                          </Stack>
                        ))}
                      </Stack>
                    </Stack>
                  )}
                </Stack>
              </Stack>
            ) : (
              // Tab 2: Individual view — top vs bottom groups for selected quiz
              <Stack pt={2} pb={2} alignItems="center">
                <Typography
                  color="#565656"
                  mb={1}
                  fontWeight={700}
                  fontSize={14}
                >
                  ({locale(head?.section3?.tab2?.cardTitle)})
                </Typography>
                <Stack className={mainClassName + "-card-content-scroll"}>
                  {perfLoading ? (
                    [0, 1].map((i) => (
                      <Stack key={i} width="50%" mt={2} mb={2}>
                        <Skeleton variant="rounded" height={56} />
                      </Stack>
                    ))
                  ) : individualStudentData.length === 0 ? (
                    <Typography
                      color="#99a0ab"
                      fontSize={14}
                      mt={2}
                      mb={2}
                      textAlign="center"
                    >
                      No quizzes assigned yet.
                    </Typography>
                  ) : (
                    individualStudentData.map((val, i) => (
                      <Stack key={i} width="50%" mt={2} mb={2}>
                        <Typography
                          textAlign="center"
                          fontWeight={400}
                          fontSize={14}
                          color="#565656"
                        >
                          {val.channel}
                        </Typography>
                        <Stack
                          mt={4}
                          direction="row"
                          justifyContent="center"
                          alignItems="center"
                        >
                          {val.student.map((name, j) => (
                            <Stack key={j} mt="-20px">
                              <ImageHandler
                                src={require(
                                  `@/images/icon/icon-student-${j % 2 === 0 ? "1" : "2"}.svg`
                                )}
                                alt="ico-student"
                                className={mainClassName + "-ico-student"}
                              />
                              <Typography
                                zIndex={1}
                                fontSize={14}
                                fontWeight={600}
                                color="#fff"
                                textAlign="center"
                                mt="-40px"
                              >
                                {name}
                              </Typography>
                            </Stack>
                          ))}
                        </Stack>
                      </Stack>
                    ))
                  )}
                </Stack>
              </Stack>
            )}
          </Card>
        </Stack>
      </TeacherCard>
    </ContentLayout>
  );
}

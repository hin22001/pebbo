import React, { Component } from "react";
import { getDataHead } from "@/app/data/head";
import {
  Card,
  CardContent,
  Stack,
  TextField,
  Typography,
  InputAdornment,
  Collapse,
  Divider,
  Table,
  TableRow,
  TableHead,
  TableCell,
  TableBody,
  IconButton as IconButtonMui,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { getLabel, locale } from "@/app/data/locale";
import { Chip, Skeleton, Button } from "@/components/elements";
import { FormGenerator } from "@/components/modules";

import dayjs from "dayjs";
import { Helpers } from "@/src/app/utils";
import { ReportDetailSection } from "./sections";
import { ContentLayout } from "../../layouts/ContentLayout";
import { ImageHandler } from "../../elements";
import { MoreVert } from "@mui/icons-material";
import { Chart } from "../../modules";
import CategoryHelpers from "../../../utils/CategoryHelpers";
import { Auth } from "../../../data/local";
import { withAppRouter } from "@/app/utils/withAppRouter";
import { headCategories } from "@/src/app/data/head/global";
import Lottie from "lottie-react";
import sikaoAnimation from "@/assets/animations/sikao.json";
import UserAPI from "@/src/app/data/api/UserAPI";

// Import sound file
const soundDailyReport = "/sounds/On_Daily_Report_Page.mp3";

export default class ReportsPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      mainClassName: "quiz-report-page",
      activeTab: 1,
      renderGraph: true,
      allChildren: [],
      head2: null,
    };

    // Audio ref for daily report sound
    this.audioRefDailyReport = null;
  }

  formatTime(totalSeconds) {
    const { head2 } = this.state;
    const absTotalSeconds = Math.abs(totalSeconds);
    const hours = String(Math.floor(absTotalSeconds / 3600)).padStart(2, "0");
    const minutes = String(Math.floor((absTotalSeconds % 3600) / 60)).padStart(
      2,
      "0",
    );
    const seconds = String(absTotalSeconds % 60).padStart(2, "0");
    return `${minutes}${locale(head2?.report?.m)} ${seconds}${locale(head2?.report?.s)}`;
  }

  // Get category label with proper language support using router locale
  getCategoryLabel(categoryStr) {
    try {
      // Get locale from router directly (prioritizes URL over localStorage)
      const currentLang = this.props.router?.locale || "zh";
      const dataUser = Auth.getDataUser();
      let year = dataUser?.year || Config.userYear || 1;
      let searchKey = String(categoryStr).trim();

      // Parse category string to handle different formats:
      // "1.5.2" -> year=1, outerKey="5", innerKey="2"
      // "1.5" -> year=1, outerKey="5"
      // "5" -> use default year, outerKey="5"
      // "5.2" -> use default year, outerKey="5", innerKey="2"

      const parts = searchKey.split(".");
      let outerKey = "";

      if (parts.length === 3) {
        // Format: "1.5.2" (year.outer_category.inner_category)
        year = parseInt(parts[0]) || year;
        outerKey = parts[1];
        searchKey = `${year}.${outerKey}`;
      } else if (parts.length === 2) {
        // Could be "1.5" (year.outer_category) or "5.2" (outer_category.inner_category)
        const firstPart = parseInt(parts[0]);
        if (firstPart >= 1 && firstPart <= 6) {
          // Likely a year
          year = firstPart;
          outerKey = parts[1];
          searchKey = `${year}.${outerKey}`;
        } else {
          // Likely outer_category.inner_category
          outerKey = parts[0];
          searchKey = `${year}.${outerKey}`;
        }
      } else if (parts.length === 1) {
        // Format: "5" (just outer_category number)
        outerKey = parts[0];
        searchKey = `${year}.${outerKey}`;
      }

      const yearData = headCategories?.[year] || {};

      // Try to find the category in any section
      for (const sectionId of Object.keys(yearData)) {
        const section = yearData[sectionId];
        if (!section) continue;

        // Try the full key first (e.g., "1.5")
        if (Object.prototype.hasOwnProperty.call(section, searchKey)) {
          const val = section[searchKey];
          if (val && typeof val === "object" && (val.en || val.zh)) {
            let text = "";
            if (currentLang === "zh") {
              text = val.zh || val.en || "";
            } else {
              // Default to English for "en" or any other language name
              text = val.en || val.zh || "";
            }
            return `${searchKey} ${text}`.trim();
          }
          if (typeof val === "string") {
            return `${searchKey} ${val}`.trim();
          }
        }

        // Try just the outer key (e.g., "5")
        if (
          outerKey &&
          Object.prototype.hasOwnProperty.call(section, outerKey)
        ) {
          const val = section[outerKey];
          if (val && typeof val === "object" && (val.en || val.zh)) {
            let text = "";
            if (currentLang === "zh") {
              text = val.zh || val.en || "";
            } else {
              text = val.en || val.zh || "";
            }
            return `${year}.${outerKey} ${text}`.trim();
          }
          if (typeof val === "string") {
            return `${year}.${outerKey} ${val}`.trim();
          }
        }

        // Try matching section ID if it matches
        if (sectionId == outerKey && section[outerKey]) {
          const val = section[outerKey];
          if (val && typeof val === "object" && (val.en || val.zh)) {
            let text = "";
            if (currentLang === "zh") {
              text = val.zh || val.en || "";
            } else {
              text = val.en || val.zh || "";
            }
            return `${year}.${outerKey} ${text}`.trim();
          }
        }
      }

      // Fallback: try to get from allChildren if available
      const { allChildren } = this.state;
      if (allChildren && Array.isArray(allChildren)) {
        const foundCategory = allChildren.find(
          (cat) =>
            cat?.id == outerKey ||
            cat?.id === searchKey ||
            cat?.id == categoryStr,
        );
        if (foundCategory?.label) {
          return foundCategory.label;
        }
      }

      // If not found, return the constructed key or original value
      return searchKey || String(categoryStr);
    } catch (e) {
      return String(categoryStr);
    }
  }

  async handleEvent(params) {
    try {
      switch (params?.type) {
        case "switch-tab":
          {
            this.setState({
              activeTab: params?.value,
              renderGraph: false,
            });
            setTimeout(() => {
              this.setState({
                renderGraph: true,
              });
            }, 1);
          }
          break;
        case "date-picker":
          {
            this.setState({
              date: params?.value,
            });
          }
          break;
      }
    } catch (err) {}
  }

  async assignHead() {
    try {
      const head2 = getDataHead({
        name: "headQuizReport",
      });

      const dataUser = Auth.getDataUser();

      let dataCategory = CategoryHelpers.getRefactorCategory(dataUser?.year);

      let allChildren = [];

      function gatherAllChildren(arr) {
        for (let item of arr) {
          if (item.child) {
            allChildren.push(...item.child);
            gatherAllChildren(item.child);
          }
        }
      }

      gatherAllChildren(dataCategory);

      this.setState({ allChildren, head2 });
    } catch (err) {}
  }

  // Play daily report sound
  playDailyReportSound() {
    const soundEnabled = localStorage.getItem("soundEnabled") !== "false";
    if (!soundEnabled) return;

    if (!this.audioRefDailyReport) {
      this.audioRefDailyReport = new Audio(soundDailyReport);
    }

    this.audioRefDailyReport.currentTime = 0;
    this.audioRefDailyReport.play().catch((err) => {
      console.error("Error playing daily report sound:", err);
    });
  }

  async componentDidMount() {
    await this.assignHead();

    // Play sound for daily report page
    if (this.props.type === "daily" || this.props.type !== "weekly") {
      this.playDailyReportSound();

      // Persistent Todo: Mark Daily Report ("report") as complete
      const todayStr = new Date().toISOString().split("T")[0];
      UserAPI.postUpdateTodos(["report"], todayStr).catch((e) =>
        console.error("Failed to sync report todo:", e),
      );
    }
  }

  render() {
    const {
      state: { mainClassName, activeTab, renderGraph, allChildren, head2 },
      props: { head, dataOverall, dataReports, userName, type },
    } = this;

    const isWeekly = type === "weekly";

    const questCompleted =
      dataReports?.learning_progress_overview?.questions_completed;
    const avgAcc = dataReports?.learning_progress_overview?.average_accuracy;
    const totTime = dataReports?.learning_progress_overview?.total_time;
    const avgTime =
      dataReports?.learning_progress_overview?.average_time_per_question;

    const graph1 = dataReports?.graph_data?.knowledge_points?.points;
    const graph2 = dataReports?.graph_data?.learning_time?.points;
    const graph3 = dataReports?.graph_data?.performance?.points;

    const tab1Data = {
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: [
          locale(head2?.report?.sunday),
          locale(head2?.report?.monday),
          locale(head2?.report?.tuesday),
          locale(head2?.report?.wednesday),
          locale(head2?.report?.thursday),
          locale(head2?.report?.friday),
          locale(head2?.report?.saturday),
        ],
      },
      yAxis: {
        type: "value",
      },
      symbolSize: 5,
      series: [
        {
          data: graph1,
          type: "line",
          smooth: true,
          areaStyle: {
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                {
                  offset: 0,
                  color: "#FF5000",
                },
                {
                  offset: 1,
                  color: "rgba(255, 80, 0, 0.1)",
                },
              ],
              global: false,
            },
          },
          itemStyle: {
            color: "#FF5000",
            borderColor: "#FF5000",
            backgroundColor: "#FF5000",
            borderWidth: 2,
          },
        },
      ],
    };

    const tab2Data = {
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: [
          locale(head2?.report?.sunday),
          locale(head2?.report?.monday),
          locale(head2?.report?.tuesday),
          locale(head2?.report?.wednesday),
          locale(head2?.report?.thursday),
          locale(head2?.report?.friday),
          locale(head2?.report?.saturday),
        ],
      },
      yAxis: {
        type: "value",
      },
      symbolSize: 5,
      series: [
        {
          data: graph2,
          type: "line",
          smooth: true,
          areaStyle: {
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                {
                  offset: 0,
                  color: "#00CDD2",
                },
                {
                  offset: 1,
                  color: "rgba(0, 205, 210, 0.1)",
                },
              ],
              global: false,
            },
          },
          itemStyle: {
            color: "#00CDD2",
            borderColor: "#00CDD2",
            backgroundColor: "#00CDD2",
            borderWidth: 2,
          },
        },
      ],
    };

    const tab3Data = {
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: ["1", "2", "3", "4", "5"],
      },
      yAxis: {
        type: "value",
      },
      symbolSize: 5,
      series: [
        {
          data: graph3,
          type: "line",
          smooth: true,
          areaStyle: {
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                {
                  offset: 0,
                  color: "#8264FF",
                },
                {
                  offset: 1,
                  color: "rgba(130, 100, 255, 0.1)",
                },
              ],
              global: false,
            },
          },
          itemStyle: {
            color: "#8264FF",
            borderColor: "#8264FF",
            backgroundColor: "#8264FF",
            borderWidth: 2,
          },
        },
      ],
    };

    return (
      <ContentLayout>
        <Stack
          className={mainClassName}
          component={"main"}
          padding={"1rem"}
          marginTop={"1rem"}
          backgroundColor="#fff"
          borderRadius="20px"
        >
          {head ? (
            <Stack>
              <Button
                startIcon="ArrowBackIosNew"
                label={getLabel({ name: "back" })}
                handleClick={() =>
                  this.props.router.push(
                    `/reports/${isWeekly ? "weekly/table" : "daily"}`,
                  )
                }
                sx={{
                  gridAutoFlow: "column",
                  width: "fit-content",
                }}
              />
              <Stack
                mt={2}
                className={
                  mainClassName + "-banner" + (isWeekly ? "" : "-daily")
                }
              >
                <Stack>
                  <Typography
                    color={isWeekly ? "#8264FF" : "#00CDD2"}
                    fontSize={28}
                    fontWeight={600}
                    sx={{ fontFamily: "'Advercase', serif !important" }}
                  >
                    {dataOverall?.date}{" "}
                    {isWeekly
                      ? locale(head2?.report?.weeklyReport)
                      : locale(head2?.report?.dailyReport)}
                  </Typography>
                  <Typography fontWeight={400} mt={3}>
                    {locale(head2?.report?.subject)}:{" "}
                    {locale(head2?.report?.[dataOverall?.subjectTitle])}
                  </Typography>
                  {/* <Typography fontWeight={400} mt={2}>Date: {dataOverall?.date}</Typography> */}
                </Stack>
                <Stack
                  sx={{
                    width: "167px",
                    height: "120px",
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Lottie
                    animationData={sikaoAnimation}
                    loop={true}
                    style={{ width: 250, height: 180 }}
                  />
                </Stack>
              </Stack>

              <Stack className={mainClassName + "-learning-overview"}>
                {/* <Typography mt={1} fontSize={20} fontWeight={600} color="#1B1B1B">Learning Data Overview</Typography> */}
                <Stack
                  direction="row"
                  p={2}
                  justifyContent="space-between"
                  mt={3}
                  className={mainClassName + "-learning-overview-grid"}
                >
                  <Stack justifyContent="center" alignItems="center">
                    <Stack mb={-5} sx={{ position: "relative", zIndex: 2 }}>
                      <img
                        src={`/images/animation/${questCompleted?.change > 0 ? "100_n.gif" : "20_n.gif"}`}
                        alt="icon"
                        width={80}
                        height={80}
                        style={{ display: "block" }}
                      />
                    </Stack>
                    <Stack
                      className={mainClassName + "-learning-overview-card"}
                      sx={{ position: "relative", zIndex: 1 }}
                    >
                      <Typography
                        fontWeight={400}
                        fontSize={20}
                        color="#8D8D8D"
                      >
                        {locale(head2?.report?.questionCompleted)}
                      </Typography>
                      <Typography
                        mt={1}
                        mb={1}
                        fontSize={28}
                        color="#1B1B1B"
                        fontWeight={600}
                        sx={{ fontFamily: "'Advercase', serif !important" }}
                      >
                        {questCompleted?.value}
                      </Typography>
                      <Stack direction="row" alignItems="center">
                        <ImageHandler
                          src={require(
                            `@/images/icon/icon-report-arrow-${questCompleted?.change > 0 ? "up" : questCompleted?.change < 0 ? "down" : "neutral"}.svg`,
                          )}
                          alt="icon"
                          width={22}
                          height={22}
                        />
                        <Typography
                          fontSize={20}
                          color={
                            questCompleted?.change > 0
                              ? "#00CDD2"
                              : questCompleted?.change < 0
                                ? "#FF5000"
                                : "#8264FF"
                          }
                          fontWeight={400}
                          ml={1}
                        >
                          {questCompleted?.change > 0
                            ? locale(head2?.report?.questionMore, {
                                value: questCompleted?.change,
                              })
                            : questCompleted?.change < 0
                              ? locale(head2?.report?.questionLess, {
                                  value: questCompleted?.change,
                                })
                              : ""}
                        </Typography>
                      </Stack>
                    </Stack>
                  </Stack>
                  <Stack justifyContent="center" alignItems="center">
                    <Stack mb={-5} sx={{ position: "relative", zIndex: 2 }}>
                      <img
                        src={`/images/animation/${avgAcc?.change > 0 ? "80_ n.gif" : "40_n.gif"}`}
                        alt="icon"
                        width={80}
                        height={80}
                        style={{ display: "block" }}
                      />
                    </Stack>
                    <Stack
                      className={mainClassName + "-learning-overview-card"}
                      sx={{ position: "relative", zIndex: 1 }}
                    >
                      <Typography
                        fontWeight={400}
                        fontSize={20}
                        color="#8D8D8D"
                      >
                        {locale(head2?.report?.avgAcc)}
                      </Typography>
                      <Typography
                        mt={1}
                        mb={1}
                        fontSize={28}
                        color="#1B1B1B"
                        fontWeight={600}
                        sx={{ fontFamily: "'Advercase', serif !important" }}
                      >
                        {avgAcc?.value}%
                      </Typography>
                      <Stack direction="row" alignItems="center">
                        <ImageHandler
                          src={require(
                            `@/images/icon/icon-report-arrow-${avgAcc?.change > 0 ? "up" : avgAcc?.change < 0 ? "down" : "neutral"}.svg`,
                          )}
                          alt="icon"
                          width={22}
                          height={22}
                        />
                        <Typography
                          fontSize={20}
                          color={
                            avgAcc?.change > 0
                              ? "#00CDD2"
                              : avgAcc?.change < 0
                                ? "#FF5000"
                                : "#8264FF"
                          }
                          fontWeight={400}
                          ml={1}
                        >
                          {avgAcc?.change > 0
                            ? locale(head2?.report?.percentageImprove, {
                                value: `${avgAcc?.change}%`,
                              })
                            : avgAcc?.change < 0
                              ? locale(head2?.report?.percentageDown, {
                                  value: `${avgAcc?.change}%`,
                                })
                              : ""}
                        </Typography>
                      </Stack>
                    </Stack>
                  </Stack>
                  <Stack justifyContent="center" alignItems="center">
                    <Stack mb={-5} sx={{ position: "relative", zIndex: 2 }}>
                      <img
                        src={`/images/animation/${totTime?.change < 0 ? "100_n.gif" : "20_n.gif"}`}
                        alt="icon"
                        width={80}
                        height={80}
                        style={{ display: "block" }}
                      />
                    </Stack>
                    <Stack
                      className={mainClassName + "-learning-overview-card"}
                      sx={{ position: "relative", zIndex: 1 }}
                    >
                      <Typography
                        fontWeight={400}
                        fontSize={20}
                        color="#8D8D8D"
                      >
                        {locale(head2?.report?.totalTime)}
                      </Typography>
                      <Typography
                        mt={1}
                        mb={1}
                        fontSize={28}
                        color="#1B1B1B"
                        fontWeight={600}
                        sx={{ fontFamily: "'Advercase', serif !important" }}
                      >
                        {this.formatTime(totTime?.value)}
                      </Typography>
                      <Stack direction="row" alignItems="center">
                        <ImageHandler
                          src={require(
                            `@/images/icon/icon-report-arrow-${totTime?.change > 0 ? "up-alt" : totTime?.change < 0 ? "down-alt" : "neutral"}.svg`,
                          )}
                          alt="icon"
                          width={22}
                          height={22}
                        />
                        <Typography
                          fontSize={20}
                          color={
                            totTime?.change < 0
                              ? "#00CDD2"
                              : totTime?.change > 0
                                ? "#FF5000"
                                : "#8264FF"
                          }
                          fontWeight={400}
                          ml={1}
                        >
                          {totTime?.change > 0
                            ? locale(head2?.report?.moreTime, {
                                value: `${this.formatTime(totTime?.change)}`,
                              })
                            : totTime?.change < 0
                              ? locale(head2?.report?.lessTime, {
                                  value: `${this.formatTime(totTime?.change)}`,
                                })
                              : ""}
                        </Typography>
                      </Stack>
                    </Stack>
                  </Stack>
                  <Stack justifyContent="center" alignItems="center">
                    <Stack mb={-5} sx={{ position: "relative", zIndex: 2 }}>
                      <img
                        src={`/images/animation/${avgTime?.change < 0 ? "80_ n.gif" : "40_n.gif"}`}
                        alt="icon"
                        width={80}
                        height={80}
                        style={{ display: "block" }}
                      />
                    </Stack>
                    <Stack
                      className={mainClassName + "-learning-overview-card"}
                      sx={{ position: "relative", zIndex: 1 }}
                    >
                      <Typography
                        fontWeight={400}
                        fontSize={20}
                        color="#8D8D8D"
                        textAlign="center"
                      >
                        {locale(head2?.report?.avgQuestionTime)}
                      </Typography>
                      <Typography
                        mt={1}
                        mb={1}
                        fontSize={28}
                        color="#1B1B1B"
                        fontWeight={600}
                        sx={{ fontFamily: "'Advercase', serif !important" }}
                      >
                        {this.formatTime(avgTime?.value)}
                      </Typography>
                      <Stack direction="row" alignItems="center">
                        <ImageHandler
                          src={require(
                            `@/images/icon/icon-report-arrow-${avgTime?.change > 0 ? "up-alt" : avgTime?.change < 0 ? "down-alt" : "neutral"}.svg`,
                          )}
                          alt="icon"
                          width={22}
                          height={22}
                        />
                        <Typography
                          fontSize={20}
                          color={
                            avgTime?.change < 0
                              ? "#00CDD2"
                              : avgTime?.change > 0
                                ? "#FF5000"
                                : "#8264FF"
                          }
                          fontWeight={400}
                          ml={1}
                        >
                          {avgTime?.change > 0
                            ? locale(head2?.report?.moreTime, {
                                value: `${this.formatTime(avgTime?.change)}`,
                              })
                            : avgTime?.change < 0
                              ? locale(head2?.report?.lessTime, {
                                  value: `${this.formatTime(avgTime?.change)}`,
                                })
                              : ""}
                        </Typography>
                      </Stack>
                    </Stack>
                  </Stack>
                </Stack>
              </Stack>

              <Stack mt={4} direction="row" justifyContent="space-between">
                <Stack className={mainClassName + "-strength"}>
                  <Typography
                    mt={1}
                    fontSize={20}
                    fontWeight={600}
                    color="#1B1B1B"
                  >
                    {locale(head2?.report?.strength)}
                  </Typography>
                  <Stack className={mainClassName + "-strength-content"}>
                    <Typography fontSize={18} fontWeight={500} color="#1B1B1B">
                      {locale(head2?.report?.significantImprove)}:
                    </Typography>
                    {dataReports?.strengths?.significantly_improved_in?.map(
                      (val, i) => (
                        <Stack
                          key={i}
                          className={mainClassName + "-strength-list-green"}
                        >
                          <Typography>{this.getCategoryLabel(val)}</Typography>
                        </Stack>
                      ),
                    )}
                  </Stack>
                  <Stack className={mainClassName + "-strength-content"}>
                    <Typography fontSize={18} fontWeight={500} color="#1B1B1B">
                      {locale(head2?.report?.steadyGrowth)}:
                    </Typography>
                    {dataReports?.strengths?.steady_growth_in?.map((val, i) => (
                      <Stack
                        key={i}
                        className={mainClassName + "-strength-list-green"}
                      >
                        <Typography>{this.getCategoryLabel(val)}</Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Stack>
                <Stack className={mainClassName + "-strength"}>
                  <Typography
                    mt={1}
                    fontSize={20}
                    fontWeight={600}
                    color="#1B1B1B"
                  >
                    {locale(head2?.report?.weakness)}
                  </Typography>
                  <Stack className={mainClassName + "-strength-content"}>
                    <Typography fontSize={18} fontWeight={500} color="#1B1B1B">
                      {locale(head2?.report?.mostMistakes)}:
                    </Typography>
                    {dataReports?.weaknesses?.most_mistakes_in?.map(
                      (val, i) => (
                        <Stack
                          key={i}
                          className={mainClassName + "-strength-list-red"}
                        >
                          <Typography>{this.getCategoryLabel(val)}</Typography>
                        </Stack>
                      ),
                    )}
                  </Stack>
                </Stack>
              </Stack>

              {isWeekly && (
                <Stack className={mainClassName + "-learning-overview"}>
                  <Stack direction="row" justifyContent="space-between">
                    <Stack className={mainClassName + "-graph-tab-wrapper"}>
                      <Stack
                        onClick={() =>
                          this.handleEvent({ type: "switch-tab", value: 1 })
                        }
                        className={
                          mainClassName +
                          "-graph-tab1" +
                          (activeTab === 1 ? "-active" : "")
                        }
                      >
                        <Typography
                          color={activeTab === 1 ? "#FF5000" : "#8D8D8D"}
                          fontWeight={500}
                        >
                          {locale(head2?.report?.knowledgePointPracticed)}
                        </Typography>
                      </Stack>
                      <Stack
                        onClick={() =>
                          this.handleEvent({ type: "switch-tab", value: 2 })
                        }
                        className={
                          mainClassName +
                          "-graph-tab2" +
                          (activeTab === 2 ? "-active" : "")
                        }
                      >
                        <Typography
                          color={activeTab === 2 ? "#FF5000" : "#8D8D8D"}
                          fontWeight={500}
                        >
                          {locale(head2?.report?.learningTime)}
                        </Typography>
                      </Stack>
                      <Stack
                        onClick={() =>
                          this.handleEvent({ type: "switch-tab", value: 3 })
                        }
                        className={
                          mainClassName +
                          "-graph-tab3" +
                          (activeTab === 3 ? "-active" : "")
                        }
                      >
                        <Typography
                          color={activeTab === 3 ? "#FF5000" : "#8D8D8D"}
                          fontWeight={500}
                        >
                          {locale(head2?.report?.performance)}
                        </Typography>
                      </Stack>
                    </Stack>
                    <IconButtonMui aria-label="more" onClick={() => {}}>
                      <MoreVert />
                    </IconButtonMui>
                  </Stack>
                  <Stack mt={6}>
                    <Typography
                      mb={4}
                      color="#1B1B1B"
                      fontSize={20}
                      fontWeight={500}
                    >
                      {activeTab === 1
                        ? locale(head2?.report?.knowledgePointPracticed)
                        : activeTab === 2
                          ? locale(head2?.report?.learningTime)
                          : locale(head2?.report?.performance)}
                    </Typography>
                    <Stack ml={-1}>
                      <Divider width="100%" />
                    </Stack>
                    <Stack
                      ml={7}
                      mb={-6}
                      mt={4}
                      direction="row"
                      alignItems="center"
                    >
                      {activeTab === 1 ? (
                        <>
                          <Stack className={mainClassName + "-graph-bullet1"} />
                          <Typography fontSize={12} color="#4F446E">
                            {locale(head2?.report?.noKnowledge)}
                          </Typography>
                        </>
                      ) : activeTab === 2 ? (
                        <>
                          <Stack className={mainClassName + "-graph-bullet2"} />
                          <Typography fontSize={12} color="#4F446E">
                            {locale(head2?.report?.timeSpentPebbo)}
                          </Typography>
                        </>
                      ) : (
                        <>
                          <Stack className={mainClassName + "-graph-bullet3"} />
                          <Typography fontSize={12} color="#4F446E">
                            {locale(head2?.report?.noQuestions)}
                          </Typography>
                        </>
                      )}
                    </Stack>
                    <Stack ml={-5}>
                      {renderGraph && (
                        <>
                          <Chart
                            option={
                              activeTab === 1
                                ? tab1Data
                                : activeTab === 2
                                  ? tab2Data
                                  : tab3Data
                            }
                            disableStyleCard={true}
                            height={400}
                            onEvents={null}
                          />
                          {activeTab === 3 && (
                            <Stack width="100%" alignItems="flex-end">
                              <Typography
                                mr={4}
                                mt={-8}
                                fontSize={12}
                                color="#4F446E"
                              >
                                {locale(head2?.report?.difficulty)}
                              </Typography>
                            </Stack>
                          )}
                        </>
                      )}
                    </Stack>
                  </Stack>
                </Stack>
              )}
            </Stack>
          ) : (
            <Skeleton type={"dashboard"} />
          )}
        </Stack>
      </ContentLayout>
    );
  }
}

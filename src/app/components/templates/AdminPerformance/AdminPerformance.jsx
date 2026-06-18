import React, { useEffect, useState } from "react";
import { getDataHead } from "@/src/app/data/head";
import {
  Card,
  Stack,
  Typography,
  Select,
  MenuItem,
  InputLabel,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import Chart from "@/modules/chart/Chart";
import AdminCard from "@/modules/card/AdminCard";
import { ContentLayout } from "@/layouts/ContentLayout";
import dayjs from "dayjs";
import { TabAdmin } from "../../elements";
import { locale } from "@/src/app/data/locale";

export default function AdminPerformance() {
  const [tabPerformance, setTabPerformance] = useState(1);
  const [renderGraph, setRenderGraph] = useState(true);

  const mainClassName = "admin-performance-page";

  const switchPerformanceTab = (id) => {
    setTabPerformance(id);
    setRenderGraph(false);
    setTimeout(() => {
      setRenderGraph(true);
    }, 1);
  };

  const head = getDataHead({
    name: "headAdminPerformance",
  });

  const optionPerformanceCategory1 = {
    xAxis: {
      type: "category",
      data: [
        "1st Sep 24",
        "1st Dec 24",
        "1st Mar 24",
        "1st Jun 25",
        "1st Sep 25",
      ],
    },
    yAxis: {
      type: "value",
    },
    series: [
      {
        data: [45, 55, 75, 15, 78],
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
      {
        data: [15, 25, 35, 65, 38],
        type: "line",
        lineStyle: {
          color: "#30D8D4",
          width: 2,
        },
        symbolSize: 8,
        itemStyle: {
          color: "#30D8D4",
          borderColor: "#30D8D4",
          borderWidth: 2,
        },
      },
      {
        data: [33, 22, 55, 77, 22],
        type: "line",
        lineStyle: {
          color: "#1E128E",
          width: 2,
        },
        symbolSize: 8,
        itemStyle: {
          color: "#1E128E",
          borderColor: "#1E128E",
          borderWidth: 2,
        },
      },
      {
        data: [22, 33, 44, 33, 66],
        type: "line",
        lineStyle: {
          color: "#962D43",
          width: 2,
        },
        symbolSize: 8,
        itemStyle: {
          color: "#962D43",
          borderColor: "#962D43",
          borderWidth: 2,
        },
      },
      {
        data: [95, 66, 88, 22, 77],
        type: "line",
        lineStyle: {
          color: "#FDA9AF",
          width: 2,
        },
        symbolSize: 8,
        itemStyle: {
          color: "#FDA9AF",
          borderColor: "#FDA9AF",
          borderWidth: 2,
        },
      },
    ],
  };

  const optionPerformanceCategory2 = {
    xAxis: {
      type: "category",
      data: [
        "1st Sep 24",
        "1st Dec 24",
        "1st Mar 24",
        "1st Jun 25",
        "1st Sep 25",
      ],
    },
    yAxis: {
      type: "value",
    },
    series: [
      {
        data: [45, 55, 75, 15, 78],
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

  const optionScoreDistribution = {
    title: [
      {
        text: locale(head?.content?.title2),
        left: "center",
      },
      // {
      //   text: 'upper: Q3 + 1.5 * IQR \nlower: Q1 - 1.5 * IQR',
      //   borderColor: '#999',
      //   borderWidth: 1,
      //   textStyle: {
      //     fontSize: 14
      //   },
      //   left: '10%',
      //   top: '90%'
      // }
    ],
    dataset: [
      {
        // prettier-ignore
        source: [
                  [850, 740, 900, 1070, 930, 850, 950, 980, 980, 880, 1000, 980, 930, 650, 760, 810, 1000, 1000, 960, 960],
              ],
      },
      {
        transform: {
          type: "boxplot",
          config: {
            itemNameFormatter: function (params) {
              return "expr " + params.value;
            },
          },
        },
      },
      {
        fromDatasetIndex: 1,
        fromTransformResult: 1,
      },
    ],
    tooltip: {
      formatter: function (param) {
        return [
          `${locale(head?.content?.minimum)}: ` + param.data[1],
          `${locale(head?.content?.q1)}: ` + param.data[2],
          `${locale(head?.content?.median)}: ` + param.data[3],
          `${locale(head?.content?.q3)}: ` + param.data[4],
          `${locale(head?.content?.maximum)}: ` + param.data[5],
        ].join("<br/>");
      },
    },
    grid: {
      left: "10%",
      right: "10%",
      bottom: "15%",
    },
    yAxis: {
      type: "category",
      boundaryGap: true,
      nameGap: 30,
      splitArea: {
        show: false,
      },
      splitLine: {
        show: false,
      },
    },
    xAxis: {
      type: "value",
      name: locale(head?.content?.subtitle2),
      splitArea: {
        show: true,
      },
    },
    series: [
      {
        name: "boxplot",
        type: "boxplot",
        datasetIndex: 1,
      },
    ],
  };

  const optionPerformanceAnalysis = {
    xAxis: {},
    yAxis: {},
    series: [
      {
        symbolSize: 20,
        data: [
          [10.0, 8.04],
          [8.07, 6.95],
          [13.0, 7.58],
          [9.05, 8.81],
          [11.0, 8.33],
          [14.0, 7.66],
          [13.4, 6.81],
          [10.0, 6.33],
          [14.0, 8.96],
          [12.5, 6.82],
          [9.15, 7.2],
          [11.5, 7.2],
          [3.03, 4.23],
          [12.2, 7.83],
          [2.02, 4.47],
          [1.05, 3.33],
          [4.05, 4.96],
          [6.03, 7.24],
          [12.0, 6.26],
          [12.0, 8.84],
          [7.08, 5.82],
          [5.02, 5.68],
        ],
        type: "scatter",
      },
      {
        data: [
          [0, 0],
          [15, 15],
        ],
        type: "line",
        lineStyle: {
          color: "red",
          width: 2,
        },
      },
    ],
  };

  return (
    <ContentLayout title="" hideTitle={true}>
      <AdminCard>
        <Stack>
          <TabAdmin
            switchTab={switchPerformanceTab}
            tabValue={tabPerformance}
            tabList={[
              locale(head?.header?.quarterlyReport),
              locale(head?.header?.quarterlyReport),
              locale(head?.header?.practiceAnalysis),
              locale(head?.header?.timeAnalysis),
            ]}
          />
          <Card className={mainClassName + "-card"}>
            {tabPerformance === 1 ? (
              <Stack p={2}>
                <ReportGrowth
                  renderGraph={renderGraph}
                  optionPerformanceCategory={optionPerformanceCategory1}
                  title={locale(head?.content?.title1)}
                  subtitle={locale(head?.content?.subtitle1)}
                  studentGroup={true}
                />
              </Stack>
            ) : tabPerformance === 2 ? (
              <Stack p={2}>
                <ReportGrowth
                  renderGraph={renderGraph}
                  optionPerformanceCategory={optionPerformanceCategory2}
                  dateFilter={true}
                  title={locale(head?.content?.title1)}
                  subtitle={locale(head?.content?.subtitle1)}
                  studentGroup={true}
                />
              </Stack>
            ) : tabPerformance === 3 ? (
              <Stack p={2}>
                <ReportGrowth
                  renderGraph={renderGraph}
                  optionPerformanceCategory={optionPerformanceAnalysis}
                  dateFilter={true}
                  title={locale(head?.content?.title3)}
                  subtitle={locale(head?.content?.subtitle3)}
                  subtitle2={locale(head?.content?.subtitle5)}
                />
              </Stack>
            ) : (
              <Stack p={2}>
                <ReportGrowth
                  renderGraph={renderGraph}
                  optionPerformanceCategory={optionPerformanceAnalysis}
                  dateFilter={true}
                  title={locale(head?.content?.title4)}
                  subtitle={locale(head?.content?.subtitle4)}
                  subtitle2={locale(head?.content?.subtitle5)}
                />
              </Stack>
            )}
          </Card>
          {tabPerformance === 1 ? (
            <Card className={mainClassName + "-card"}>
              <Stack p={2}>
                <Stack mt={2}>
                  <Stack ml={-5}>
                    {renderGraph && (
                      <Chart
                        option={optionScoreDistribution}
                        disableStyleCard={true}
                        height={400}
                        onEvents={null}
                      />
                    )}
                  </Stack>
                </Stack>
              </Stack>
            </Card>
          ) : tabPerformance === 2 ? (
            <Card className={mainClassName + "-card"}>
              <Stack p={2}>
                <Stack mt={2}>
                  <Stack ml={-5}>
                    {renderGraph && (
                      <Chart
                        option={optionScoreDistribution}
                        disableStyleCard={true}
                        height={400}
                        onEvents={null}
                      />
                    )}
                  </Stack>
                </Stack>
              </Stack>
            </Card>
          ) : (
            <></>
          )}
        </Stack>
      </AdminCard>
    </ContentLayout>
  );
}

function ReportGrowth(props) {
  const [isOpen, setIsOpen] = useState(false);
  const [typeDate, setTypeDate] = useState(1);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const mainClassName = "admin-performance-page";

  const {
    optionPerformanceCategory,
    renderGraph,
    dateFilter,
    title,
    subtitle,
    subtitle2,
    studentGroup,
  } = props;

  const head = getDataHead({
    name: "headAdminPerformance",
  });

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleDateChange = (date) => {
    if (typeDate === 1) {
      setStartDate(date);
    } else {
      setEndDate(date);
    }
    handleClose();
  };

  const handleOpen = (type) => {
    setTypeDate(type);
    setIsOpen(true);
  };

  return (
    <>
      <Stack mb={2} direction="row" alignItems="center">
        <Select
          value={1}
          // onChange={handleChange}
          displayEmpty
          inputProps={{ "aria-label": "Without label" }}
          style={{ width: "100px", height: "40px" }}
        >
          <MenuItem value={1}>P1</MenuItem>
          <MenuItem value={2}>P2</MenuItem>
        </Select>

        <Select
          value={1}
          // onChange={handleChange}
          displayEmpty
          inputProps={{ "aria-label": "Without label" }}
          style={{ width: "120px", height: "40px", marginLeft: "15px" }}
          placeholder="Subject"
        >
          <MenuItem value={1}>Subject 1</MenuItem>
          <MenuItem value={2}>Subject 2</MenuItem>
        </Select>

        {dateFilter === true && (
          <>
            <Stack ml={2} style={{ marginTop: "-7px" }}>
              <Stack
                zIndex={1}
                direction="row"
                backgroundColor="#FFF"
                width="275px"
                alignItems="center"
              >
                <Stack className={mainClassName + "-search-box-border-wrapper"}>
                  <Stack className={mainClassName + "-search-box-label"}>
                    <Typography color="#565656">
                      {locale(head?.content?.startMonth)}
                    </Typography>
                  </Stack>
                  <Stack
                    onClick={() => handleOpen(1)}
                    className={mainClassName + "-search-box"}
                  >
                    <Typography
                      className="cursor-pointer"
                      fontSize={14}
                      color="#565656"
                    >
                      {startDate
                        ? dayjs(startDate).format("MM YYYY")
                        : "mm/yyyy"}
                    </Typography>
                  </Stack>
                </Stack>
              </Stack>
              <Stack zIndex={0} mt={-7} backgroundColor="#FFF">
                <DatePicker
                  value={startDate}
                  onChange={handleDateChange}
                  open={isOpen && typeDate === 1}
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

            <Stack ml={-10} style={{ marginTop: "-7px" }}>
              <Stack
                zIndex={1}
                direction="row"
                backgroundColor="#FFF"
                width="275px"
                alignItems="center"
              >
                <Stack className={mainClassName + "-search-box-border-wrapper"}>
                  <Stack className={mainClassName + "-search-box-label"}>
                    <Typography color="#565656">
                      {locale(head?.content?.endMonth)}
                    </Typography>
                  </Stack>
                  <Stack
                    onClick={() => handleOpen(2)}
                    className={mainClassName + "-search-box"}
                  >
                    <Typography
                      className="cursor-pointer"
                      fontSize={14}
                      color="#565656"
                    >
                      {endDate ? dayjs(endDate).format("MM YYYY") : "mm/yyyy"}
                    </Typography>
                  </Stack>
                </Stack>
              </Stack>
              <Stack zIndex={0} mt={-7} backgroundColor="#FFF">
                <DatePicker
                  value={endDate}
                  onChange={handleDateChange}
                  open={isOpen && typeDate === 2}
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
          </>
        )}
      </Stack>
      <Stack mb={2} direction="row" justifyContent="space-between">
        <Stack direction="row" alignItems="center">
          <Stack
            mr={2}
            className={mainClassName + "-table-filter-label-wrapper"}
          >
            <Stack className={mainClassName + "-table-filter-label"}>
              <Typography color="#595959">
                {locale(head?.content?.categories)}
              </Typography>
            </Stack>
            <Select
              value={""}
              // onChange={handleChange}
              displayEmpty
              inputProps={{ "aria-label": "Without label" }}
              style={{
                width: "200px",
                height: "35px",
                backgroundColor: "#FFF",
              }}
              renderValue={(selected) => {
                if (selected === "") {
                  return (
                    <Typography color="#00000040">
                      {locale(head?.content?.filter)}
                    </Typography>
                  );
                }
                return selected;
              }}
            >
              <MenuItem value={1}>Cat 1</MenuItem>
              <MenuItem value={2}>Cat 2</MenuItem>
              <MenuItem value={3}>Cat 3</MenuItem>
            </Select>
          </Stack>
          <Stack
            mr={2}
            className={mainClassName + "-table-filter-label-wrapper"}
          >
            <Stack className={mainClassName + "-table-filter-label"}>
              <Typography color="#595959">
                {locale(head?.content?.difficulties)}
              </Typography>
            </Stack>
            <Select
              value={""}
              // onChange={handleChange}
              displayEmpty
              inputProps={{ "aria-label": "Without label" }}
              style={{
                width: "200px",
                height: "35px",
                backgroundColor: "#FFF",
              }}
              renderValue={(selected) => {
                if (selected === "") {
                  return (
                    <Typography color="#00000040">
                      {locale(head?.content?.filter)}
                    </Typography>
                  );
                }
                return selected;
              }}
            >
              {/* <InputLabel value="">
                <em>Placeholder Text</em>
              </InputLabel> */}
              <MenuItem value={1}>Level 1</MenuItem>
              <MenuItem value={2}>Level 2</MenuItem>
              <MenuItem value={3}>Level 3</MenuItem>
            </Select>
          </Stack>
          {studentGroup && (
            <Stack className={mainClassName + "-table-filter-label-wrapper"}>
              <Stack className={mainClassName + "-table-filter-label"}>
                <Typography color="#595959">
                  {locale(head?.content?.studentGroup)}
                </Typography>
              </Stack>
              <Select
                value={""}
                // onChange={handleChange}
                displayEmpty
                inputProps={{ "aria-label": "Without label" }}
                style={{
                  width: "200px",
                  height: "35px",
                  backgroundColor: "#FFF",
                }}
                renderValue={(selected) => {
                  if (selected === "") {
                    return (
                      <Typography color="#00000040">
                        {locale(head?.content?.filter)}
                      </Typography>
                    );
                  }
                  return selected;
                }}
              >
                <MenuItem value={1}>Group A</MenuItem>
                <MenuItem value={2}>Group B</MenuItem>
                <MenuItem value={3}>Group C</MenuItem>
              </Select>
            </Stack>
          )}
        </Stack>
        <Stack direction="row" alignItems="center">
          <Stack mr={2} className={mainClassName + "-btn-clear"}>
            <Typography color="#595959">
              {locale(head?.content?.clear)}
            </Typography>
          </Stack>
          <Stack className={mainClassName + "-btn-search"}>
            <Typography color="#FFF">
              {locale(head?.content?.createGraph)}
            </Typography>
          </Stack>
        </Stack>
      </Stack>
      <Stack mt={2}>
        <Typography fontSize={16} fontWeight={600} textAlign="center">
          {title}
        </Typography>
        <Typography mb={-7} mt={2} fontSize={10} fontWeight={300}>
          {subtitle}
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
        {subtitle2 && (
          <Typography
            textAlign="end"
            mt={-5}
            pr={5}
            fontSize={10}
            fontWeight={300}
          >
            {subtitle2}
          </Typography>
        )}
      </Stack>
    </>
  );
}

import { getLabel, locale } from "@/src/app/data/locale";
import {
  Stack,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from "@mui/material";
import React from "react";
import Chart from "@/modules/chart/Chart";
import { CategoryHelpers, Helpers } from "@/src/app/utils";
import { Tooltip } from "../../../elements";
import _ from "lodash";
import { Auth } from "../../../../data/local";
import { headCategories } from "@/src/app/data/head/global";
import { Config } from "@/src/app/constant";
import { useRouter } from "next/navigation";

export default function ReportDetailSection(props) {
  const mainClassName = "section-reports-detail";
  const router = useRouter();

  const { title, data } = props;

  const [category, setCategory] = React.useState();

  React.useEffect(() => {
    const dataUser = Auth.getDataUser();

    const dataCategory = CategoryHelpers.getRefactorCategory(
      dataUser?.year,
    )?.flatMap((i) => i.child);

    setCategory(dataCategory);
  }, []);

  // Get category label with proper language support (similar to QuestionPage)
  const getCategoryLabel = (outerCategory) => {
    try {
      // Get locale from router directly (prioritizes URL over localStorage)
      const currentLang = router?.locale || "zh";
      const dataUser = Auth.getDataUser();
      let year = dataUser?.year || Config.userYear || 1;
      let searchKey = String(outerCategory).trim();

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
      const constructedKey = searchKey;

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
              // Default to English for "en" or any other language
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

      // Fallback: try to get from category array if available
      if (category && Array.isArray(category)) {
        const foundCategory = category.find(
          (cat) =>
            cat?.id == outerKey ||
            cat?.id === searchKey ||
            cat?.id == outerCategory,
        );
        if (foundCategory?.label) {
          return foundCategory.label;
        }
      }

      // If not found, return the constructed key or original value
      return searchKey || String(outerCategory);
    } catch (e) {
      return String(outerCategory);
    }
  };

  return (
    <Stack component={"section"} spacing={2}>
      {data?.length > 0 &&
        data?.map((item, index) => {
          return (
            <Stack
              spacing={1}
              className="card-flat"
              width={"100%"}
              maxWidth={"500px"}
              key={mainClassName + "-data-" + index}
            >
              <Typography component="h3" className="text-h3" textAlign={"left"}>
                {locale(item?.title)}
              </Typography>
              {item?.content?.length > 0 && (
                <Table>
                  <TableBody>
                    {item?.content?.map((content, contentIndex) => {
                      let isLast, refactorValue;
                      let color = "";

                      try {
                        isLast = Boolean(index < data?.length - 1);

                        const isChangeExist =
                          _.has(content, "change") ||
                          _.has(content, "change_s") ||
                          _.has(content, "change_m");
                        const isIncrease =
                          (content?.change ||
                            content?.change_s ||
                            content?.change_m) > 0;

                        if (isChangeExist) {
                          if (isIncrease) {
                            color = "text-green";
                          } else {
                            color = "text-red";
                          }
                        }

                        if (_.has(content, "increaseOrdecrease")) {
                          if (content?.increaseOrdecrease == "increase") {
                            color = "text-green";
                          }
                          if (content?.increaseOrdecrease == "decrease") {
                            color = "text-red";
                          }
                        }

                        const arrNoColorAttr = ["time"];

                        refactorValue = _.mapValues(
                          Helpers.filterObjectByKey(content, "text"),
                          (i, key) => {
                            let string = "";

                            if (key == "category") {
                              const arrCategory = i.split(", ");

                              if (arrCategory?.length) {
                                arrCategory.forEach((ii, indexCategory) => {
                                  // Use getCategoryLabel to get proper language
                                  let title = getCategoryLabel(ii);
                                  const isLast =
                                    indexCategory + 1 == arrCategory.length;

                                  string =
                                    string +
                                    `<span title='${title}'>${title}</span>` +
                                    (isLast ? "" : ", ");
                                });
                              }
                            }

                            return (
                              "<b class=" +
                              (!arrNoColorAttr?.includes(key) ? color : "") +
                              ">" +
                              string +
                              "</b>"
                            );
                          },
                        );
                      } catch (err) {}

                      let refactorLabelChart = content?.data?.labels || [];

                      return (
                        <TableRow
                          sx={
                            isLast && {
                              "&:last-child td, &:last-child th": { border: 0 },
                            }
                          }
                          key={mainClassName + "-content-" + contentIndex}
                        >
                          {
                            {
                              table: (
                                <>
                                  <TableCell>
                                    <Typography component="body1">
                                      {locale(content?.title)}
                                    </Typography>
                                  </TableCell>

                                  <TableCell>
                                    <Typography component="body1">
                                      <b>{content?.value}</b>
                                      {" " + content?.unit}
                                    </Typography>
                                  </TableCell>
                                </>
                              ),

                              list: (
                                <TableCell>
                                  <Typography
                                    component="body1"
                                    dangerouslySetInnerHTML={{
                                      __html: _.has(refactorValue, "category")
                                        ? `<span>
                                          ${locale(content?.text, {
                                            ...(refactorValue || {}),
                                          })}
                                      </span>`
                                        : locale(content?.text, {
                                            ...(refactorValue || {}),
                                          }),
                                    }}
                                  ></Typography>
                                </TableCell>
                              ),
                              graph: (
                                <Chart
                                  disableStyleCard={true}
                                  title={content?.title}
                                  option={{
                                    tooltip: {
                                      trigger: "axis",
                                      formatter: function (params) {
                                        const graphItem = params[0];

                                        var val =
                                          // graphItem?.marker + ' ' +
                                          content?.x_axis_title +
                                          ": <b>" +
                                          graphItem?.axisValue +
                                          "</b> <br/> " +
                                          graphItem?.seriesName +
                                          ": <b>" +
                                          graphItem?.value +
                                          "</b>";

                                        return val;
                                      },
                                    },
                                    xAxis: {
                                      type: "category",
                                      data: refactorLabelChart,
                                      // name: content?.x_axis_title,
                                    },
                                    yAxis: {
                                      type: "value",
                                      // name: content?.y_axis_title,
                                    },
                                    series: [
                                      {
                                        data: content?.data?.points,
                                        name: content?.y_axis_title,
                                        type: "line",
                                      },
                                    ],
                                  }}
                                />
                              ),
                            }[item?.type]
                          }
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </Stack>
          );
        })}
    </Stack>
  );
}

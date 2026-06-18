import React from "react";

import {
  Avatar,
  Box,
  Divider,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";

import classnames from "classnames";

export default function index(props) {
  const { type, row, className, sx, height, width } = props;

  const mainClassName = "element-loader-skeleton";

  const refactorClassName = classnames(
    mainClassName,
    className,
    type ? "type-" + type : "type-default",
  );

  switch (type) {
    case "profile":
      {
        return (
          <Box
            className={refactorClassName}
            sx={{ display: "flex", alignItems: "center" }}
          >
            <Box sx={{ margin: 1 }}>
              <Skeleton variant="circular">
                <Avatar />
              </Skeleton>
            </Box>
            <Box sx={{ width: "100%" }}>
              <Typography variant="body1">
                <Skeleton width="100%" />
              </Typography>
              <Typography variant="caption">
                <Skeleton width="100%" />
              </Typography>
            </Box>
          </Box>
        );
      }
      break;

    case "image":
      {
        return (
          <Box className={refactorClassName} sx={sx}>
            <Skeleton variant="rounded" width="100%" height="100%" />
          </Box>
        );
      }
      break;

    case "row":
      {
        const items = Array(row).fill(1);

        return (
          <Box className={refactorClassName} sx={sx}>
            {items.map((item, index) => [
              <div
                key={"skeleton-item-" + index}
                className="wrap-skeleton-item"
              >
                <Skeleton width="100%" height="50px" />
                <Skeleton width="100%" />
                <Skeleton width="100%" />
              </div>,
            ])}
          </Box>
        );
      }
      break;

    case "dashboard":
      {
        return (
          <Stack className={refactorClassName} sx={sx} spacing={2}>
            <Stack direction={"row"} justifyContent={"space-between"}>
              <Stack
                sx={{
                  width: "100%",
                }}
              >
                <Skeleton
                  variant="text"
                  sx={{
                    minWidth: "5rem",
                    width: "20%",
                  }}
                />
                <Skeleton
                  variant="text"
                  sx={{
                    minWidth: "5rem",
                    width: "30%",
                    height: "2rem",
                  }}
                />
              </Stack>
              <Stack
                direction={"row"}
                spacing={2}
                sx={{
                  width: "100%",
                }}
                alignItems={"end"}
              >
                <Skeleton
                  variant="text"
                  sx={{
                    minWidth: "5rem",
                    width: "100%",
                    height: "2rem",
                  }}
                />
                <Skeleton
                  variant="text"
                  sx={{
                    minWidth: "5rem",
                    width: "100%",
                    height: "2rem",
                  }}
                />
              </Stack>
            </Stack>

            <Stack direction={"row"} spacing={1}>
              <Stack
                spacing={0}
                className={"card-flat"}
                sx={{
                  width: "100%",
                  height: "100%",
                }}
              >
                <Stack
                  sx={{
                    width: "60%",
                    height: "100%",
                  }}
                  spacing={1}
                >
                  <Skeleton
                    variant="rectangular"
                    sx={{
                      minWidth: "5rem",
                      width: "50%",
                      height: "1.7rem",
                    }}
                  />
                  <Skeleton
                    variant="rectangular"
                    sx={{
                      minWidth: "5rem",
                      width: "100%",
                      height: "4rem",
                    }}
                  />
                  <Skeleton
                    variant="rectangular"
                    sx={{
                      minWidth: "5rem",
                      width: "100%",
                      height: "1rem",
                    }}
                  />
                </Stack>
              </Stack>
              <Stack
                spacing={0}
                className={"card-flat"}
                sx={{
                  width: "100%",
                  height: "100%",
                }}
              >
                <Stack
                  sx={{
                    width: "60%",
                    height: "100%",
                  }}
                  spacing={1}
                >
                  <Skeleton
                    variant="rectangular"
                    sx={{
                      minWidth: "5rem",
                      width: "50%",
                      height: "1.7rem",
                    }}
                  />
                  <Skeleton
                    variant="rectangular"
                    sx={{
                      minWidth: "5rem",
                      width: "100%",
                      height: "4rem",
                    }}
                  />
                  <Skeleton
                    variant="rectangular"
                    sx={{
                      minWidth: "5rem",
                      width: "100%",
                      height: "1rem",
                    }}
                  />
                </Stack>
              </Stack>
            </Stack>

            <Stack direction={"row"} spacing={1}>
              <Stack
                className={"card-flat"}
                sx={{
                  width: "70%",
                }}
                spacing={2}
              >
                <Skeleton
                  variant="text"
                  sx={{
                    minWidth: "5rem",
                    width: "100%",
                    height: "3rem",
                  }}
                />
                <Skeleton
                  variant="rectangular"
                  sx={{
                    width: "100%",
                    height: "20rem",
                    borderRadius: "1rem",
                  }}
                />
              </Stack>
              <Stack
                className={"card-flat"}
                sx={{
                  width: "30%",
                }}
                spacing={2}
              >
                <Skeleton
                  variant="text"
                  sx={{
                    minWidth: "5rem",
                    width: "100%",
                    height: "3rem",
                  }}
                />
                <Skeleton
                  variant="rectangular"
                  sx={{
                    width: "100%",
                    height: "20rem",
                    borderRadius: "1rem",
                  }}
                />
              </Stack>
            </Stack>

            <Stack
              direction={"row"}
              spacing={1}
              sx={{
                paddingBottom: "1rem",
              }}
            >
              <Stack
                className={"card-flat"}
                sx={{
                  width: "100%",
                }}
                spacing={2}
              >
                <Skeleton
                  variant="text"
                  sx={{
                    minWidth: "5rem",
                    width: "100%",
                    height: "3rem",
                  }}
                />
                <Skeleton
                  variant="rectangular"
                  sx={{
                    width: "100%",
                    height: "20rem",
                    borderRadius: "1rem",
                  }}
                />
              </Stack>
            </Stack>
          </Stack>
        );
      }
      break;
    case "table":
      {
        const rows = Array(25).fill(1);
        const columns = Array(5).fill(1);

        return (
          <Stack className={refactorClassName} sx={sx} spacing={2}>
            <Stack direction={"row"} justifyContent={"space-between"}>
              <Stack
                sx={{
                  width: "100%",
                }}
              >
                <Skeleton
                  variant="text"
                  sx={{
                    minWidth: "5rem",
                    width: "20%",
                  }}
                />
                <Skeleton
                  variant="text"
                  sx={{
                    minWidth: "5rem",
                    width: "30%",
                    height: "2rem",
                  }}
                />
              </Stack>
              <Stack
                direction={"row"}
                spacing={2}
                sx={{
                  width: "100%",
                }}
                alignItems={"end"}
              >
                <Skeleton
                  variant="text"
                  sx={{
                    minWidth: "5rem",
                    width: "100%",
                    height: "2rem",
                  }}
                />
                <Skeleton
                  variant="text"
                  sx={{
                    minWidth: "5rem",
                    width: "100%",
                    height: "2rem",
                  }}
                />
              </Stack>
            </Stack>

            <Stack
              direction={"row"}
              spacing={1}
              sx={{
                paddingBottom: "1rem",
              }}
            >
              <Stack
                className={"card-flat"}
                sx={{
                  width: "100%",
                  padding: "1rem",
                }}
                spacing={3}
              >
                {rows?.map((row, indexRow) => {
                  return (
                    <Stack key={mainClassName + "-type-table-row-" + indexRow}>
                      <Stack direction={"row"} spacing={2}>
                        {columns?.map((column, indexColumn) => {
                          return (
                            <Skeleton
                              key={
                                mainClassName +
                                "-type-table-column-" +
                                indexRow +
                                "-" +
                                indexColumn
                              }
                              variant="rectangular"
                              sx={{
                                minWidth: "5rem",
                                width: "100%",
                                height: "1rem",
                                borderRadius: ".5rem",
                              }}
                            />
                          );
                        })}
                      </Stack>
                      {indexRow == 0 && (
                        <Divider
                          sx={{
                            marginTop: "1rem",
                          }}
                        />
                      )}
                    </Stack>
                  );
                })}
              </Stack>
            </Stack>
          </Stack>
        );
      }
      break;

    default:
      {
        return (
          <Box className={refactorClassName} sx={sx}>
            <Skeleton
              variant="text"
              width={width || "100%"}
              height={height || "100%"}
            />
          </Box>
        );
      }
      break;
  }
}

import React from "react";
import { Stack, Select, MenuItem, Skeleton } from "@mui/material";
import { locale } from "@/locale";

const YearSelector = ({
  mainClassName,
  dataUser,
  head2,
  loadingYear = false,
  onChangeYear,
}) => {
  const yearList = [
    { value: 1, label: "oneYear" },
    { value: 2, label: "twoYear" },
    { value: 3, label: "threeYear" },
    { value: 4, label: "fourYear" },
    { value: 5, label: "fiveYear" },
    { value: 6, label: "sixYear" },
  ];

  return (
    <Stack
      className={mainClassName + "-logo"}
      direction={"row"}
      spacing={2}
      alignItems={"center"}
    >
      {loadingYear ? (
        <Skeleton className={mainClassName + "-select-year-skeleton"} />
      ) : (
        <Select
          className={mainClassName + "-select-year"}
          value={dataUser?.year}
          displayEmpty
          onChange={onChangeYear}
          sx={{
            fontFamily: "'Advercase', serif !important",
            letterSpacing: "0.07rem",
            "& .MuiSelect-select": {
              fontFamily: "'Advercase', serif !important",
              letterSpacing: "0.07rem",
            },
          }}
        >
          {yearList?.map((val, i) => (
            <MenuItem
              key={i}
              value={val?.value}
              disabled={![2, 5].includes(val?.value)}
              sx={{
                fontFamily: "'Advercase', serif !important",
                letterSpacing: "0.07rem",
                cursor: ![2, 5].includes(val?.value)
                  ? "not-allowed !important"
                  : "pointer",
                pointerEvents: ![2, 5].includes(val?.value) ? "auto" : "auto", // Allow hover effects even if disabled so cursor shows
              }}
            >
              <span
                dangerouslySetInnerHTML={{
                  __html: locale(head2?.[val?.label]),
                }}
              />
            </MenuItem>
          ))}
        </Select>
      )}
    </Stack>
  );
};

export default YearSelector;

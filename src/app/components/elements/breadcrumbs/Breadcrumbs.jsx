"use client";
import React from "react";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Typography from "@mui/material/Typography";
import Link from "next/link";

export default function Breadcrumb(props) {
  const { data } = props;

  return (
    <div className="element-breadcrumbs">
      <Breadcrumbs separator="›" aria-label="breadcrumb">
        {data?.length > 0 && (
          <>
            {data.map((item, index) => {
              if (index < data.length) {
                return (
                  <Link key={index + 1} href={item.href || ""}>
                    {item.label}
                  </Link>
                );
              } else {
                return (
                  <Typography
                    color="textPrimary"
                    key={"breadcrum-item-" + index}
                  >
                    {item?.label}
                  </Typography>
                );
              }
            })}
          </>
        )}
      </Breadcrumbs>
    </div>
  );
}

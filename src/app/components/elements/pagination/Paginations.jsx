"use client";
import React from "react";
import { Divider, Box, makeStyles } from "@mui/material";
import Pagination from "@mui/material/Pagination";

export default function Paginations(props) {
  const { activePage, itemsPerPage, data, handleChange } = props;

  const [countPages, setCountPages] = React.useState(
    Math.ceil(data.length / itemsPerPage),
  );

  React.useEffect(() => {
    setCountPages(Math.ceil(data.length / itemsPerPage));
  }, [data, itemsPerPage]);

  return (
    <div className="paginations">
      <Divider />
      <Box component="span">
        <Pagination
          count={countPages}
          page={activePage}
          onChange={handleChange}
          defaultPage={1}
          color="primary"
          size="large"
          showFirstButton
          showLastButton
        />
      </Box>
    </div>
  );
}

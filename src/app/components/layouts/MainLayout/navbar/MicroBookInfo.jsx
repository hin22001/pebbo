import React from "react";
import { Stack, Typography } from "@mui/material";
import ImageHandler from "@/elements/image/ImageHandler";
import { locale } from "@/locale";

const MicroBookInfo = ({ mainClassName, head2 }) => {
  return (
    <Stack direction="row" className="desktop-only">
      <Stack direction="row" className={mainClassName + "-ico-wrapper"}>
        <ImageHandler
          className={mainClassName + "-ico"}
          src={require("@/images/icon/icon-book.svg")}
          alt="ico book"
        />
        <Typography>{locale(head2?.microBook)}</Typography>
      </Stack>
    </Stack>
  );
};

export default MicroBookInfo;

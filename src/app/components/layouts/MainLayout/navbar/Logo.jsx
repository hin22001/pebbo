import React from "react";
import { Stack } from "@mui/material";
import ImageHandler from "@/elements/image/ImageHandler";
import LinkWrapper from "@/modules/link/LinkWrapper";

const Logo = ({ mainClassName, showLink = true, href = "/dashboard" }) => {
  const logoContent = (
    <ImageHandler
      src={require("@/images/logo/logo-pebbo-white.svg")}
      alt="Logo Pebbo"
      className="image-contain"
    />
  );

  return (
    <Stack
      className={mainClassName + "-logo"}
      direction={"row"}
      spacing={2}
      alignItems={"center"}
    >
      {showLink ? (
        <LinkWrapper className={mainClassName + "-logo-link"} href={href}>
          {logoContent}
        </LinkWrapper>
      ) : (
        logoContent
      )}
    </Stack>
  );
};

export default Logo;

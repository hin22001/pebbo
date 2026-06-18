"use client";
import { getDataHead } from "@/app/data/head";
import {
  Select,
  Stack,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  Menu,
  MenuItem,
} from "@mui/material";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Dropdown from "@/elements/dropdown/Dropdown";
import { Helpers } from "@/app/utils";
import { getLabel } from "@/src/app/data/locale";
import { Language } from "@/src/app/data/local";
import nProgress from "nprogress";
import React, { useState } from "react";
import ImageHandler from "@/elements/image/ImageHandler";

export default function SelectLanguage(props) {
  const { float, label, usePartialRefresh, type, useLabel } = props;

  let useLabel_ = true;

  if (useLabel) {
    useLabel_ = useLabel;
  }

  const [showModal, setShowModal] = useState(null);

  const mainClassName = "section-dropdown-select-language";

  const nextRouter = useRouter();
  const pathname = usePathname() ?? "";
  const searchParams = useSearchParams();
  const searchString =
    searchParams && typeof searchParams.toString === "function"
      ? searchParams.toString()
      : "";
  const asPath = searchString ? `${pathname}?${searchString}` : pathname;

  const lang = Helpers.getCurrentLanguage();

  const listLang = getDataHead({ name: "headLanguage" });

  const switchLang = (newLang) => {
    Language.setLanguage(newLang);
    const path = Helpers.hrefLocale(asPath || "/");

    if (usePartialRefresh) {
      nextRouter.push(path);
    } else {
      window.location.replace(path);
    }
  };

  React.useEffect(() => {
    nProgress.done();
  }, []);

  if (type === "switch") {
    return (
      <Stack className="switch-wrapper" direction="row">
        <Stack
          onClick={() => {}}
          className={lang === "zh" ? "switchBtnActive" : "switchBtnInActive"}
          sx={{
            cursor: "not-allowed !important",
            opacity: 0.5,
          }}
        >
          中
        </Stack>
        <Stack
          onClick={() => switchLang("en")}
          className={lang === "en" ? "switchBtnActive" : "switchBtnInActive"}
        >
          Eng
        </Stack>
      </Stack>
    );
  }

  return (
    <Stack
      direction="row"
      spacing={1}
      alignItems={"center"}
      className={mainClassName + " " + (float ? "float" : "")}
    >
      {/* <Typography className="text-subtitle" variant='subtitle2'>{getLabel({ name: 'selectedRegion' }) + ": "}</Typography> */}

      <Stack
        onClick={(e) => setShowModal(e?.currentTarget)}
        className="lang-wrapper"
      >
        <ImageHandler
          src={require(`@/images/icon/ico-${lang === "en" ? "uk" : "hk"}.svg`)}
          alt="lang"
          className="lang-flag"
        />
        {useLabel !== false && (
          <Typography
            className="lang-text"
            sx={{
              fontFamily: "'Advercase', serif !important",
              letterSpacing: "0.07rem",
            }}
          >
            {listLang?.find((val) => val?.id === lang)?.label}
          </Typography>
        )}
      </Stack>

      <Menu
        sx={{ mt: "30px" }}
        className={mainClassName + "-menu"}
        id="menu-user-card"
        anchorEl={showModal}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        keepMounted
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        open={Boolean(showModal)}
        onClose={() => setShowModal(null)}
      >
        {listLang?.length > 0 &&
          listLang?.map((val, index) => (
            <MenuItem
              key={index + 1}
              onClick={() => {
                if (val.id === "zh") return;
                nProgress.start();
                switchLang(val.id);
                setShowModal(null);
              }}
              selected={lang === val.id}
              disabled={val.id === "zh"}
              sx={{
                cursor: val.id === "zh" ? "not-allowed !important" : "pointer",
              }}
            >
              <ImageHandler
                src={require(
                  `@/images/icon/ico-${val.label === "English" ? "uk" : "hk"}.svg`,
                )}
                alt="lang"
                className="lang-flag"
              />
              <Typography
                sx={{
                  fontFamily: "'Advercase', serif !important",
                  letterSpacing: "0.07rem",
                }}
              >
                {val.label}
              </Typography>
            </MenuItem>
          ))}
      </Menu>

      {/* <Dropdown
        data={listLang}
        defaultValue={lang}
        label={label}
        handleChange={(event) => {
          nProgress.start()
          const newLang = event.target.value
          switchLang(newLang)
        }}

      /> */}
    </Stack>
  );
}

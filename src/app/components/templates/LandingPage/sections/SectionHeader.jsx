import React, { Component } from "react";
import { Stack, Typography } from "@mui/material";
import Button from "@/elements/button/Button";
import ImageHandler from "@/elements/image/ImageHandler";
import Switch from "@/elements/switch/Switch";
import { Config } from "@/src/app/constant";
import { Auth, Language } from "@/src/app/data/local";
import { Helpers } from "@/src/app/utils";
import { withAppRouter } from "@/app/utils/withAppRouter";
import { locale } from "@/src/app/data/locale";
import { Alert, Announcement, Loader } from "../../../elements";
import SelectLanguage from "../../../sections/dropdown/SelectLanguage";
import { getLabel } from "../../../../data/locale";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";

class index extends Component {
  constructor(props) {
    super(props);

    this.state = {
      mainClassName: "template-landing-page",
      openMobile: false,
      loader: false,
    };
  }

  async handleEvent(params) {
    try {
      switch (params?.type) {
        case "switch-lang":
          {
            const newLang = params?.value;

            Helpers.switchLang(newLang);
          }
          break;
      }
    } catch (err) {}
  }

  async initialize() {
    try {
      const dataUser = await Auth.getDataUser();
      const isAuthenticated = dataUser != null;

      this.setState({
        isAuthenticated,
        dataUser,
      });
    } catch (err) {}
  }

  async componentDidMount() {
    await this.initialize();
  }

  navigate(path) {
    this.setState({ loader: true });
    this.props.router.push(path);
  }

  render() {
    const {
      state: { mainClassName, isAuthenticated, dataUser, openMobile, loader },
      props: { head, active },
    } = this;

    return (
      <Stack className={mainClassName + "-outer-header"}>
        <Announcement />
        <Loader isOpen={loader} />

        <Stack className={mainClassName + "-header"}>
          <Stack className={mainClassName + "-header-left"}>
            <Stack onClick={() => this.navigate("/")}>
              <ImageHandler
                className={mainClassName + "-header-center-btn"}
                src={Config.logo}
                width={100}
                height="fit-content"
              />
            </Stack>

            <Stack className={mainClassName + "-header-center"}>
              <Stack
                onClick={() => this.navigate("/")}
                className={mainClassName + "-header-center-btn"}
              >
                <Typography
                  className={
                    mainClassName +
                    `-header-center-btn-text-${active === "features" ? "" : "in"}active`
                  }
                >
                  {locale(head?.sectionHeader?.label?.features)}
                </Typography>
              </Stack>
              <Stack
                onClick={() => this.navigate("/about")}
                className={mainClassName + "-header-center-btn"}
              >
                <Typography
                  className={
                    mainClassName +
                    `-header-center-btn-text-${active === "about" ? "" : "in"}active`
                  }
                >
                  {locale(head?.sectionHeader?.label?.aboutUs)}
                </Typography>
              </Stack>
              <Stack
                onClick={() => this.navigate("/pricing")}
                className={mainClassName + "-header-center-btn"}
              >
                <Typography
                  className={
                    mainClassName +
                    `-header-center-btn-text-${active === "pricing" ? "" : "in"}active`
                  }
                >
                  {locale(head?.sectionHeader?.label?.pricing)}
                </Typography>
              </Stack>
              <Stack
                onClick={() => this.navigate("/contact")}
                className={mainClassName + "-header-center-btn"}
              >
                <Typography
                  className={
                    mainClassName +
                    `-header-center-btn-text-${active === "contact" ? "" : "in"}active`
                  }
                >
                  {locale(head?.sectionHeader?.label?.contact)}
                </Typography>
              </Stack>
            </Stack>
          </Stack>

          <Stack className={mainClassName + "-header-right"}>
            <Stack
              onClick={() =>
                this.navigate(
                  isAuthenticated
                    ? dataUser?.role?.name === "Teacher"
                      ? "/teacher/dashboard"
                      : "/dashboard"
                    : "/login"
                )
              }
              className={mainClassName + "-header-right-btn-login"}
            >
              {isAuthenticated ? (
                <Typography className={mainClassName + "-header-right-btn-txt"}>
                  {dataUser?.role?.name === "Teacher"
                    ? locale(head?.sectionHeader?.label?.teacherPortal)
                    : dataUser?.role?.name === "Admin"
                      ? locale(head?.sectionHeader?.label?.adminPortal)
                      : locale(head?.sectionHeader?.label?.studentPortal)}
                </Typography>
              ) : (
                <Typography className={mainClassName + "-header-right-btn-txt"}>
                  {locale(head?.sectionHeader?.label?.login)}
                </Typography>
              )}
            </Stack>
            <Stack
              onClick={() => this.navigate("/signup")}
              className={mainClassName + "-header-right-btn-start"}
            >
              <Typography className={mainClassName + "-header-right-btn-txt"}>
                {locale(head?.sectionHeader?.label?.getStarted)}
              </Typography>
            </Stack>
            <Stack className={mainClassName + "-content-desktop"}>
              <SelectLanguage
                label={getLabel({ name: "selectedRegion" })}
                useLabel={true}
              />
            </Stack>
          </Stack>

          <Stack
            onClick={() => this.setState({ openMobile: !openMobile })}
            className={mainClassName + "-content-mobile"}
          >
            {openMobile ? (
              <CloseIcon sx={{ fontSize: "35px" }} />
            ) : (
              <MenuIcon sx={{ fontSize: "35px" }} />
            )}
          </Stack>
        </Stack>

        {openMobile && (
          <Stack className={mainClassName + "-header-mobile"}>
            <Stack className={mainClassName + "-header-mobile-center"}>
              <Stack
                onClick={() => this.navigate("/")}
                className={mainClassName + "-header-mobile-center-btn"}
              >
                <Typography
                  className={
                    mainClassName +
                    `-header-mobile-center-btn-text-${active === "features" ? "" : "in"}active`
                  }
                >
                  {locale(head?.sectionHeader?.label?.features)}
                </Typography>
              </Stack>
              <Stack
                onClick={() => this.navigate("/about")}
                className={mainClassName + "-header-mobile-center-btn"}
              >
                <Typography
                  className={
                    mainClassName +
                    `-header-mobile-center-btn-text-${active === "about" ? "" : "in"}active`
                  }
                >
                  {locale(head?.sectionHeader?.label?.aboutUs)}
                </Typography>
              </Stack>
              <Stack
                onClick={() => this.navigate("/pricing")}
                className={mainClassName + "-header-mobile-center-btn"}
              >
                <Typography
                  className={
                    mainClassName +
                    `-header-mobile-center-btn-text-${active === "pricing" ? "" : "in"}active`
                  }
                >
                  {locale(head?.sectionHeader?.label?.pricing)}
                </Typography>
              </Stack>
              <Stack
                onClick={() => this.navigate("/contact")}
                className={mainClassName + "-header-mobile-center-btn"}
              >
                <Typography
                  className={
                    mainClassName +
                    `-header-mobile-center-btn-text-${active === "contact" ? "" : "in"}active`
                  }
                >
                  {locale(head?.sectionHeader?.label?.contact)}
                </Typography>
              </Stack>
            </Stack>

            <Stack className={mainClassName + "-header-mobile-right"}>
              <Stack
                onClick={() =>
                  this.navigate(
                    isAuthenticated
                      ? dataUser?.role?.name === "Teacher"
                        ? "/teacher/dashboard"
                        : "/dashboard"
                      : "/login"
                  )
                }
                className={mainClassName + "-header-mobile-right-btn-login"}
              >
                {isAuthenticated ? (
                  <Typography
                    className={mainClassName + "-header-mobile-right-btn-txt"}
                  >
                    {dataUser?.role?.name === "Teacher"
                      ? locale(head?.sectionHeader?.label?.teacherPortal)
                      : dataUser?.role?.name === "Admin"
                        ? locale(head?.sectionHeader?.label?.adminPortal)
                        : locale(head?.sectionHeader?.label?.studentPortal)}
                  </Typography>
                ) : (
                  <Typography
                    className={mainClassName + "-header-mobile-right-btn-txt"}
                  >
                    {locale(head?.sectionHeader?.label?.login)}
                  </Typography>
                )}
              </Stack>
              <Stack
                onClick={() => this.navigate("/signup")}
                className={mainClassName + "-header-mobile-right-btn-start"}
              >
                <Typography
                  className={mainClassName + "-header-mobile-right-btn-txt"}
                >
                  {locale(head?.sectionHeader?.label?.getStarted)}
                </Typography>
              </Stack>
              <SelectLanguage
                label={getLabel({ name: "selectedRegion" })}
                useLabel={false}
              />
            </Stack>
          </Stack>
        )}
      </Stack>
    );
  }
}

export default withAppRouter(index);

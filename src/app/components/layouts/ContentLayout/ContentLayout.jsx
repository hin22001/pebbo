import React, { Component } from "react";

import { Alert, Breadcrumbs, Loader, Skeleton } from "@/elements";

import Head from "next/head";
import { Stack, Typography } from "@mui/material";
import { locale } from "@/app/data/locale";
import { List, NoticeCard } from "@/modules";
import { getDataHead } from "@/src/app/data/head";
import _ from "lodash";
import ImageBG from "@/images/decor/decor-bottom-study.png";
import { Auth } from "@/src/app/data/local";
import { Config } from "@/src/app/constant";

export default class ContentLayout extends Component {
  // === Notes ===
  // => Handling Alert
  // => Handling Loader
  // => Handling Modal

  constructor(props) {
    super(props);

    this.state = {
      mainClassName: "content-layout",
      showLoader: false,
      alert: {
        isOpen: false,
        message: "",
        type: "info",
      },
    };
  }

  closeAlert() {
    this.setState({
      alert: {
        ...this.state.alert,
        isOpen: false,
      },
    });
  }

  openAlert(message, type = "error") {
    this.setState({
      alert: {
        ...this.state.alert,
        isOpen: true,
        message: message,
        type: type,
      },
    });
  }

  openLoader() {
    this.setState({
      showLoader: true,
    });
  }

  closeLoader() {
    this.setState({
      showLoader: false,
    });
  }

  assignPropsLoader() {
    this.setState({
      showLoader: this.props.showLoader,
    });
  }

  async componentDidMount() {
    await this.assignPropsLoader();
    const isAuth = Auth.checkLocalAuth();

    this.setState({
      isAuth,
    });
    const currentLocation = window?.location;
    this.setState({
      currentLocation,
    });
  }

  async componentDidUpdate(prevProps) {
    if (prevProps.showLoader !== this.props.showLoader) {
      await this.assignPropsLoader();
    }
  }

  async componentWillUnmount() {
    try {
    } catch (err) {}
  }

  render() {
    const {
      state: {
        mainClassName,
        showLoader,
        alert,
        headCategories,
        isAuth,
        currentLocation,
      },
      props: {
        children,
        title,
        theme,
        className,
        customTitle,
        breadcrumbs,
        hideTitle,
        slot,
        useBgImage,
        sx,
        overflow,
        seo,
      },
    } = this;

    const isHeaderActive = Boolean(
      (title && !hideTitle) || breadcrumbs || slot?.tools,
    );

    const refactorTitle =
      locale(customTitle) ||
      Config.appName + (title ? " - " + locale(title) : "");
    return (
      <>
        <Head>
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
          <meta property="og:type" content="website" />

          <title>{refactorTitle}</title>

          {/* Manifest */}
          <link rel="manifest" href="/manifest.json" />

          {/* Icons for PWA */}
          <link
            rel="icon"
            href="/images/illustration/illustration-mascot.png"
          />
          <link
            rel="apple-touch-icon"
            href="/images/illustration/illustration-mascot.png"
          />

          {/* Meta Tags */}
          <meta name="theme-color" content="#000000" />

          {/* Mobile Compatibility */}
          <meta name="mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta
            name="apple-mobile-web-app-status-bar-style"
            content="black-translucent"
          />
          <meta name="apple-mobile-web-app-title" content="Pebbo" />

          {/* <link rel="icon" href="/favicon.ico" /> */}
          <link rel="canonical" href={currentLocation?.href} />

          <meta
            name="og:image"
            content={currentLocation?.origin + "/favicon.ico"}
          />
          <meta
            property="og:image"
            content={currentLocation?.origin + "/favicon.ico"}
          />
          <meta property="og:image:alt" content={refactorTitle} />
          <meta property="og:url" content={currentLocation?.href} />

          {seo && (
            <>
              <meta
                name="description"
                itemProp="description"
                content={locale(seo?.meta?.description)}
              />
              <meta
                property="og:description"
                content={locale(seo?.meta?.description)}
              />
              <meta
                property="og:title"
                content={locale(seo?.meta?.title)}
                key="title"
              />
            </>
          )}
        </Head>

        <Stack
          className={
            mainClassName +
            " " +
            (className || "") +
            " " +
            (theme || "") +
            " " +
            (!isHeaderActive ? "header-disabled" : "") +
            " " +
            (useBgImage ? "bg-image" : "")
          }
          style={
            useBgImage && {
              backgroundImage: `url(${useBgImage?.image || ImageBG?.src})`,
            }
          }
          sx={sx}
        >
          {alert.isOpen && (
            <Alert
              {...(alert || {})}
              handleClose={this.closeAlert.bind(this)}
              theme="float"
            />
          )}

          {isHeaderActive && isAuth && (
            <Stack
              className={mainClassName + "-header"}
              direction={"row"}
              spacing={1}
              justifyContent="space-between"
            >
              {title && !hideTitle ? (
                <Typography
                  className={mainClassName + "-header-title"}
                  variant="h6"
                  component="h1"
                >
                  {locale(title)}
                </Typography>
              ) : (
                <div></div>
              )}
              {
                // breadcrumbs ?
                // 	<Breadcrumbs data={breadcrumbs} />
                // 	:
                // 	<div></div>
              }

              {slot?.tools}
            </Stack>
          )}

          <Loader isOpen={showLoader} />

          <div
            className={mainClassName + "-main " + (overflow ? "overflow" : "")}
          >
            {Boolean(children) ? (
              isAuth === false ? (
                <NoticeCard headType={"accessDenied"} />
              ) : (
                children
              )
            ) : (
              <Skeleton type={"dashboard"} />
            )}
          </div>
        </Stack>
      </>
    );
  }
}

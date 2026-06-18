import React, { Component } from "react";
import { Stack, Typography } from "@mui/material";
import AnimationWrapper from "@/elements/animation/AnimationWrapper";
import Button from "@/elements/button/Button";
import ImageHandler from "@/elements/image/ImageHandler";
import SwiperCustom from "@/elements/swiper/SwiperCustom";
import Switch from "@/elements/switch/Switch";
import { Skeleton } from "@mui/material";
import { Config } from "@/src/app/constant";
import { locale } from "@/src/app/data/locale";
import { Helpers } from "@/src/app/utils";

export default class index extends Component {
  constructor(props) {
    super(props);

    this.state = {
      mainClassName: "template-landing-page-section-about",
    };
  }

  async handleEvent(params) {
    try {
      switch (params?.type) {
        case "event":
          {
          }
          break;
      }
    } catch (err) {}
  }

  async initialize() {
    try {
    } catch (err) {}
  }

  async componentDidMount() {
    await this.initialize();
  }

  render() {
    const {
      state: { mainClassName },
      props: { head },
    } = this;

    return (
      <Stack component={"section"} className={mainClassName}>
        <Stack className={"container"}>
          <Stack className={mainClassName + "-content section-content"}>
            <Stack
              className={mainClassName + "-text-wrapper-title"}
              direction={"row"}
              spacing={1}
              alignItems={"center"}
            >
              <Typography
                component="h2"
                className={
                  mainClassName + "-text-title text-hero " + Helpers.fontZH()
                }
                textAlign={"center"}
                sx={{
                  fontFamily: "'Advercase', serif !important",
                  letterSpacing: "0.07rem",
                }}
              >
                {locale(head?.sectionAbout?.text?.title1)}
              </Typography>

              <ImageHandler
                src={Config.logo}
                className={mainClassName + "-image-logo"}
                width={150}
                heightFitContent={true}
              />
              <Typography
                component="h2"
                className={
                  mainClassName + "-text-title text-hero " + Helpers.fontZH()
                }
                textAlign={"center"}
                sx={{
                  fontFamily: "'Advercase', serif !important",
                  letterSpacing: "0.07rem",
                }}
              >
                {locale(head?.sectionAbout?.text?.title2)}
              </Typography>
              <Typography
                component="h2"
                className={
                  mainClassName + "-text-title text-hero " + Helpers.fontZH()
                }
                textAlign={"center"}
                sx={{
                  fontFamily: "'Advercase', serif !important",
                  letterSpacing: "0.07rem",
                }}
              >
                {locale(head?.sectionAbout?.text?.title3)}
              </Typography>
            </Stack>

            <Stack
              className={mainClassName + "-text-wrapper"}
              spacing={1}
              alignItems={"center"}
              justifyContent={"center"}
            >
              <Typography
                className={mainClassName + "-text-subtitle " + Helpers.fontZH()}
                component={"h3"}
                sx={{
                  fontFamily: "'Advercase', serif !important",
                  letterSpacing: "0.07rem",
                }}
              >
                {locale(head?.sectionAbout?.text?.subtitle)}
              </Typography>

              <Button
                headType="freeTrial"
                className={"lp-button-free-trial " + Helpers.fontZH()}
                href={Helpers.hrefLocale("/login")}
              />
            </Stack>

            <Stack
              alignItems={"center"}
              justifyContent={"center"}
              className={mainClassName + "-list-wrapper "}
            >
              <ul className={mainClassName + "-list "}>
                {head?.sectionAbout?.list?.map((item, index) => {
                  return (
                    <li
                      key={mainClassName + "-list-item-" + index}
                      className={mainClassName + "-list-item "}
                    >
                      <Typography>
                        <b>{locale(item?.title) + " : "}</b>
                        <span>{locale(item?.label)}</span>
                      </Typography>
                    </li>
                  );
                })}
              </ul>
            </Stack>

            <AnimationWrapper
              animationTrue="animate__fadeInLeftBig"
              animationFalse="animate__fadeOutLeftBig"
            >
              <ImageHandler
                src={require("@/images/illustration/illustration-mascot-math.png")}
                className={mainClassName + "-image-decor"}
                width={500}
                height={500}
                overridePercent={"contain"}
                quality={100}
              />
            </AnimationWrapper>
            <AnimationWrapper
              animationTrue="animate__fadeInRightBig"
              animationFalse="animate__fadeOutRightBig"
            >
              <ImageHandler
                src={require("@/images/illustration/illustration-mascot-playing.png")}
                className={mainClassName + "-image-decor right"}
                width={500}
                height={500}
                overridePercent={"contain"}
                quality={100}
              />
            </AnimationWrapper>
          </Stack>
        </Stack>
      </Stack>
    );
  }
}

import React, { Component } from "react";
import { Stack, Typography } from "@mui/material";
import Button from "@/elements/button/Button";
import ImageHandler from "@/elements/image/ImageHandler";
import SwiperCustom from "@/elements/swiper/SwiperCustom";
import Switch from "@/elements/switch/Switch";
import { Config } from "@/src/app/constant";
import { locale } from "@/src/app/data/locale";
import { Helpers } from "@/src/app/utils";
import Image from "next/image";
import iconBookMath from "@/images/icon/icon-book-math.svg";
import iconPotter from "@/images/icon/icon-potter.svg";
import iconDiamond from "@/images/icon/icon-group-diamond.svg";
import illustrationMascot from "@/images/illustration/illustration-mascot.png";
import illustrationWhy1 from "@/images/illustration/illustration-why-1.png";
import illustrationWhy2 from "@/images/illustration/illustration-why-2.png";
import illustrationWhy3 from "@/images/illustration/illustration-why-3.png";

export default class index extends Component {
  constructor(props) {
    super(props);

    this.state = {
      mainClassName: "template-landing-page",
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
      props: { head, imageWidth },
    } = this;

    return (
      <Stack className={mainClassName + "-feature"}>
        <Typography
          className={mainClassName + "-feature-title"}
          sx={{ fontFamily: "'Advercase', serif !important" }}
        >
          {locale(head?.sectionFeature?.title)}
        </Typography>

        <Stack className={mainClassName + "-feature-row-wrapper"}>
          <Stack className={mainClassName + "-feature-row"}>
            <Stack className={mainClassName + "-feature-row-number"}>
              <Typography
                className={mainClassName + "-feature-row-number-txt"}
                sx={{ fontFamily: "'Advercase', serif !important" }}
              >
                1
              </Typography>
            </Stack>
            <Stack className={mainClassName + "-feature-row-content"}>
              <Stack
                className={"bg-img-center"}
                sx={{
                  background: `url(${iconBookMath.src})`,
                }}
              />
              <Stack
                className={mainClassName + "-feature-row-content-txt-wrapper"}
              >
                <Typography
                  className={mainClassName + "-feature-row-content-txt-title"}
                  sx={{ fontFamily: "'Advercase', serif !important" }}
                  dangerouslySetInnerHTML={{
                    __html: locale(head?.sectionFeature?.row1?.title),
                  }}
                />
                <Typography
                  className={mainClassName + "-feature-row-content-txt-desc"}
                >
                  <span style={{ fontWeight: 600, color: "#000" }}>
                    {locale(head?.sectionFeature?.row1?.subTitle)}
                  </span>
                  <br />→ {locale(head?.sectionFeature?.row1?.point1)}
                  <br />→ {locale(head?.sectionFeature?.row1?.point2)}
                </Typography>
              </Stack>
              <Stack
                className={"bg-img-center"}
                sx={{
                  background: `url(${illustrationWhy1.src})`,
                }}
              />
            </Stack>
          </Stack>
          <Stack className={mainClassName + "-feature-row-end"}>
            <Stack className={mainClassName + "-feature-row-number"}>
              <Typography
                className={mainClassName + "-feature-row-number-txt"}
                sx={{ fontFamily: "'Advercase', serif !important" }}
              >
                2
              </Typography>
            </Stack>
            <Stack className={mainClassName + "-feature-row-content-end"}>
              <Stack
                className={"bg-img-center"}
                sx={{
                  background: `url(${illustrationWhy2.src})`,
                }}
              />
              <Stack
                className={mainClassName + "-feature-row-content-txt-wrapper"}
              >
                <Typography
                  className={mainClassName + "-feature-row-content-txt-title"}
                  dangerouslySetInnerHTML={{
                    __html: locale(head?.sectionFeature?.row2?.title),
                  }}
                />
                <Typography
                  className={mainClassName + "-feature-row-content-txt-desc"}
                >
                  <span style={{ fontWeight: 600, color: "#000" }}>
                    {locale(head?.sectionFeature?.row2?.subTitle)}
                  </span>
                  <br />→ {locale(head?.sectionFeature?.row2?.point1)}
                  <br />→ {locale(head?.sectionFeature?.row2?.point2)}
                  <br />→ {locale(head?.sectionFeature?.row2?.point3)}
                </Typography>
              </Stack>
              <Stack
                className={"bg-img-center"}
                sx={{
                  background: `url(${iconPotter.src})`,
                }}
              />
            </Stack>
          </Stack>
          <Stack className={mainClassName + "-feature-row"}>
            <Stack className={mainClassName + "-feature-row-number"}>
              <Typography
                className={mainClassName + "-feature-row-number-txt"}
                sx={{ fontFamily: "'Advercase', serif !important" }}
              >
                3
              </Typography>
            </Stack>
            <Stack className={mainClassName + "-feature-row-content"}>
              <Stack
                className={"bg-img-center"}
                sx={{
                  background: `url(${illustrationMascot.src})`,
                }}
              />
              <Stack
                className={mainClassName + "-feature-row-content-txt-wrapper"}
              >
                <Typography
                  className={mainClassName + "-feature-row-content-txt-title"}
                  dangerouslySetInnerHTML={{
                    __html: locale(head?.sectionFeature?.row3?.title),
                  }}
                />
                <Typography
                  className={mainClassName + "-feature-row-content-txt-desc"}
                >
                  <span style={{ fontWeight: 600, color: "#000" }}>
                    {locale(head?.sectionFeature?.row3?.subTitle)}
                  </span>
                  <br />→ {locale(head?.sectionFeature?.row3?.point1)}
                  <br />→ {locale(head?.sectionFeature?.row3?.point2)}
                  <br />→ {locale(head?.sectionFeature?.row3?.point3)}
                  <br />→ {locale(head?.sectionFeature?.row3?.point4)}
                </Typography>
              </Stack>
              <Stack
                className={"bg-img-center"}
                sx={{
                  background: `url(${illustrationWhy1.src})`,
                }}
              />
            </Stack>
          </Stack>
          <Stack className={mainClassName + "-feature-row-end"}>
            <Stack className={mainClassName + "-feature-row-number"}>
              <Typography className={mainClassName + "-feature-row-number-txt"}>
                4
              </Typography>
            </Stack>
            <Stack className={mainClassName + "-feature-row-content-end"}>
              <Stack
                className={"bg-img-center"}
                sx={{
                  background: `url(${illustrationWhy3.src})`,
                }}
              />
              <Stack
                className={mainClassName + "-feature-row-content-txt-wrapper"}
              >
                <Typography
                  className={mainClassName + "-feature-row-content-txt-title"}
                  dangerouslySetInnerHTML={{
                    __html: locale(head?.sectionFeature?.row4?.title),
                  }}
                />
                <Typography
                  className={mainClassName + "-feature-row-content-txt-desc"}
                >
                  <span style={{ fontWeight: 600, color: "#000" }}>
                    {locale(head?.sectionFeature?.row4?.subTitle)}
                  </span>
                  <br />→ {locale(head?.sectionFeature?.row4?.point1)}
                  <br />→ {locale(head?.sectionFeature?.row4?.point2)}
                  <br />→ {locale(head?.sectionFeature?.row4?.point3)}
                  <br />→ {locale(head?.sectionFeature?.row4?.point4)}
                </Typography>
              </Stack>
              <Stack
                className={"bg-img-center"}
                sx={{
                  background: `url(${iconDiamond.src})`,
                }}
              />
            </Stack>
          </Stack>
        </Stack>

        <Stack className={mainClassName + "-feature-buble"}>
          <Image
            alt="img"
            width={imageWidth}
            src={require("@/images/illustration/illustration-about-buble-2.svg")}
          />
        </Stack>
      </Stack>
    );
  }
}

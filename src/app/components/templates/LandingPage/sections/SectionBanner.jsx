import React, { Component } from "react";
import { Stack, Typography } from "@mui/material";
import Button from "@/elements/button/Button";
import ImageHandler from "@/elements/image/ImageHandler";
import SwiperCustom from "@/elements/swiper/SwiperCustom";
import Switch from "@/elements/switch/Switch";
import { Config } from "@/src/app/constant";
import { locale } from "@/src/app/data/locale";
import { Helpers } from "@/src/app/utils";
import { withAppRouter } from "@/app/utils/withAppRouter";

class index extends Component {
  constructor(props) {
    super(props);

    this.state = {
      mainClassName: "template-landing-page",
    };
  }

  navigate(path) {
    this.props.router.push(path);
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
      props: { head, imageWidth, imageWidthChild },
    } = this;

    return (
      <Stack className={mainClassName + "-banner"}>
        <Stack className={mainClassName + "-banner-title"}>
          <Typography
            className={mainClassName + "-banner-title-txt"}
            sx={{
              fontFamily: "'Advercase', serif !important",
              letterSpacing: "0.07rem",
            }}
            dangerouslySetInnerHTML={{
              __html: locale(head?.sectionBanner?.title1),
            }}
          />
          <Typography
            className={mainClassName + "-banner-title-txt"}
            sx={{
              fontFamily: "'Advercase', serif !important",
              letterSpacing: "0.07rem",
            }}
            dangerouslySetInnerHTML={{
              __html: locale(head?.sectionBanner?.title2),
            }}
          />
          <Typography
            className={mainClassName + "-banner-title-txt"}
            sx={{
              fontFamily: "'Advercase', serif !important",
              letterSpacing: "0.07rem",
            }}
            dangerouslySetInnerHTML={{
              __html: locale(head?.sectionBanner?.title3),
            }}
          />
          <Stack
            onClick={() => this.navigate("/signup")}
            className={mainClassName + "-banner-title-btn"}
          >
            <Typography className={mainClassName + "-banner-title-btn-txt"}>
              {locale(head?.sectionBanner?.btn)}
            </Typography>
          </Stack>

          <Stack className={mainClassName + "-banner-img"}>
            <ImageHandler
              src={require("@/images/illustration/illustration-mp4-1.png")}
              className={mainClassName + "-banner-img-mp4"}
              quality={100}
              width={imageWidthChild}
              height={imageWidthChild * 0.6796}
            />

            <ImageHandler
              src={require("@/images/illustration/illustration-tablet.png")}
              className={mainClassName + "-banner-img-frame"}
              quality={100}
              width={imageWidth}
              height={imageWidth * 0.7759}
            />
          </Stack>
        </Stack>
        {/* <Stack
          className={'container wide'}
        >
          <Stack
            className={mainClassName + '-content section-content'}
          >

            <Stack
              className={mainClassName + '-text-wrapper'}
            >
              <Typography component='h1' className={mainClassName + '-text-wrapper-title animate__animated animate__fadeInDown ' + Helpers.fontZH()}
                dangerouslySetInnerHTML={{ __html: locale(head?.sectionBanner?.title) }}
              >
              </Typography>
              <Button
                headType='freeTrial'
                className={'lp-button-free-trial ' + Helpers.fontZH()}
                href={Helpers.hrefLocale('/login')}
              />
              <Typography className={mainClassName + '-text-wrapper-subtitle text-h4 animate__animated animate__fadeInUp ' + Helpers.fontZH()}
                component={'h3'}
              >
                {locale(head?.sectionBanner?.subtitle)}
              </Typography>

            </Stack>

            <ImageHandler
              src={require('@/images/banner/banner-math.png')}
              className={mainClassName + '-image next-image-size-strict-contain '}
              quality={100}
              size={1200}
            />




          </Stack>
        </Stack> */}
      </Stack>
    );
  }
}

export default withAppRouter(index);

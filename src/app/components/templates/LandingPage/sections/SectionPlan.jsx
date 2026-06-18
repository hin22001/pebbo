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
      <Stack className={mainClassName + "-plan"}>
        <Typography
          className={mainClassName + "-plan-txt"}
          sx={{
            fontFamily: "'Advercase', serif !important",
            letterSpacing: "0.07rem",
          }}
          dangerouslySetInnerHTML={{
            __html: locale(head?.sectionPlan?.label1),
          }}
        />
        <Typography
          className={mainClassName + "-plan-txt"}
          sx={{
            fontFamily: "'Advercase', serif !important",
            letterSpacing: "0.07rem",
          }}
          dangerouslySetInnerHTML={{
            __html: locale(head?.sectionPlan?.label2),
          }}
        />
        <Stack
          onClick={() => this.props.router.push("/pricing")}
          className={mainClassName + "-plan-btn"}
        >
          <Typography className={mainClassName + "-plan-btn-txt"}>
            {locale(head?.sectionPlan?.btn)}
          </Typography>
        </Stack>
      </Stack>
    );
  }
}

export default withAppRouter(index);

import React, { Component } from "react";
import { Stack, Typography } from "@mui/material";
import Button from "@/elements/button/Button";
import ImageHandler from "@/elements/image/ImageHandler";
import SwiperCustom from "@/elements/swiper/SwiperCustom";
import Switch from "@/elements/switch/Switch";
import { Config } from "@/src/app/constant";
import { locale } from "@/src/app/data/locale";
import { Helpers } from "@/src/app/utils";

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
      props: { head },
    } = this;

    return (
      <div className={mainClassName + "-instagram"}>
        <Typography
          className={mainClassName + "-instagram-desc"}
          dangerouslySetInnerHTML={{
            __html: locale(head?.sectionInstagram?.label),
          }}
        />
      </div>
    );
  }
}

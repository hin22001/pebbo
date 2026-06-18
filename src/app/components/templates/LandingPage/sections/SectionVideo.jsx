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
      mainClassName: "template-landing-page-section-video",
      videoURL: "https://www.youtube.com/watch?v=7ZhKZqkgVuw",
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
      state: { mainClassName, videoURL },
      props: { head },
    } = this;

    return (
      <Stack component={"section"} className={mainClassName}>
        <Stack className={"container wide"}>
          <Stack className={mainClassName + "-content section-content"}>
            <Stack className={mainClassName + "-video"} alignItems={"center"}>
              <Stack className={mainClassName + "-video-wrapper"}>
                <iframe
                  allowtransparency="true"
                  style={{ background: "#FFFFFF" }}
                  src={Helpers.refactorYoutubeURL(videoURL)}
                />
              </Stack>
              <Stack className={mainClassName + "-button"}>
                <Button
                  headType="demo"
                  className={"lp-button-free-trial " + Helpers.fontZH()}
                />
              </Stack>

              <ImageHandler
                src={require("@/images/decor/decor-frame-board.png")}
                className={mainClassName + "-image-decor"}
                width={1900}
                height={1200}
                quality={100}
                overridePercent={"cover"}
              />
            </Stack>
          </Stack>
        </Stack>
      </Stack>
    );
  }
}

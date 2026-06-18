import React, { Component } from "react";
import { Stack, Typography } from "@mui/material";
import Button from "@/elements/button/Button";
import ImageHandler from "@/elements/image/ImageHandler";
import SwiperCustom from "@/elements/swiper/SwiperCustom";
import Switch from "@/elements/switch/Switch";
import { Config } from "@/src/app/constant";
import { locale } from "@/src/app/data/locale";
import SwiperCore, { Navigation, Pagination, Autoplay } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import Image from "next/image";

import "swiper/css";
import { Helpers } from "@/src/app/utils";
export default class index extends Component {
  constructor(props) {
    super(props);

    this.state = {
      mainClassName: "template-landing-page-section-partners",
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
      <Stack
        component={"section"}
        className={mainClassName}
        justifyContent={"center"}
      >
        <Stack className={"container wide"}>
          <Stack
            className={mainClassName + "-content section-content"}
            spacing={5}
            justifyContent={"center"}
          >
            <Typography
              component="h2"
              className={
                mainClassName + "-text-title text-hero " + Helpers.fontZH()
              }
              textAlign={"center"}
            >
              {locale(head?.sectionPartners?.title)}
            </Typography>

            <SwiperCustom
              data={head?.sectionPartners?.content}
              slidesPerView={"break"}
            />
          </Stack>
        </Stack>
      </Stack>
    );
  }
}

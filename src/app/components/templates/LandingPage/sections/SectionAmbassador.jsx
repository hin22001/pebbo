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
      mainClassName: "template-landing-page-section-ambassador",
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
              <ImageHandler
                src={Config.logo}
                className={mainClassName + "-image-logo"}
                width={100}
                heightFitContent={true}
              />
              <Typography
                component="h2"
                className={
                  mainClassName + "-text-title text-hero " + Helpers.fontZH()
                }
                textAlign={"center"}
              >
                {locale(head?.sectionAmbassador?.text?.title)}
              </Typography>
            </Stack>

            <Stack className={mainClassName + "-main-content"}>
              <ImageHandler
                src={require("@/images/illustration/illustration-class-room.png")}
                className={mainClassName + "-image"}
                data-aos="fade-up-left"
                width={900}
                height={600}
                overridePercent={"contain"}
                quality={100}
              />
              <Stack
                alignItems={"center"}
                justifyContent={"center"}
                className={mainClassName + "-list-wrapper "}
              >
                <Stack
                  className={mainClassName + "-text-wrapper"}
                  spacing={1}
                  alignItems={"center"}
                  justifyContent={"center"}
                >
                  <Typography
                    className={
                      mainClassName +
                      "-text-subtitle  color-purple " +
                      Helpers.fontZH()
                    }
                    component={"h3"}
                  >
                    {locale(head?.sectionAmbassador?.text?.subtitle)}
                  </Typography>

                  {/* <Button
                    {...(head?.sectionAmbassador?.button || {})}
                  /> */}
                </Stack>
                <ul className={mainClassName + "-list "}>
                  {head?.sectionAmbassador?.list?.map((item, index) => {
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
            </Stack>
          </Stack>
        </Stack>
      </Stack>
    );
  }
}

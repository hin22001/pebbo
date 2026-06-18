import React, { Component } from "react";
import { Stack, Typography } from "@mui/material";
import Button from "@/elements/button/Button";
import ImageHandler from "@/elements/image/ImageHandler";
import SwiperCustom from "@/elements/swiper/SwiperCustom";
import Switch from "@/elements/switch/Switch";
import { Config } from "@/src/app/constant";
import { locale } from "@/src/app/data/locale";
import { Helpers } from "@/src/app/utils";
import classnames from "classnames";

export default class index extends Component {
  constructor(props) {
    super(props);

    this.state = {
      mainClassName: "template-landing-page-section-guide",
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
      props: { head, type, theme },
    } = this;

    const currentHead = type && head?.sectionGuide[type];

    return (
      <Stack
        component={"section"}
        className={classnames(mainClassName, theme, "type-" + type)}
      >
        <Stack className={"container"}>
          <Stack className={mainClassName + "-content section-content"}>
            <Stack
              className={mainClassName + "-text-wrapper-title"}
              alignItems={"center"}
            >
              <Typography
                component="h2"
                className={
                  mainClassName + "-text-title text-hero " + Helpers.fontZH()
                }
                textAlign={"center"}
              >
                {locale(currentHead?.title)}
              </Typography>
              <Typography
                component="h3"
                className={
                  mainClassName +
                  "-text-subtitle lp-text-subtitle " +
                  Helpers.fontZH()
                }
              >
                {locale(currentHead?.subtitle)}
              </Typography>
            </Stack>
            <Stack className={mainClassName + "-main-content "}>
              <Stack
                alignItems={"center"}
                justifyContent={"center"}
                className={mainClassName + "-list-wrapper "}
              >
                <Stack
                  className={mainClassName + "-list "}
                  component="ul"
                  // direction='row'
                  spacing={3}
                >
                  {currentHead?.list?.map((item, index) => {
                    return (
                      <Stack
                        component={"li"}
                        key={mainClassName + "-list-item-" + index}
                        className={mainClassName + "-list-item "}
                      >
                        <Stack
                          className={mainClassName + "-list-item-wrap-text "}
                          direction={"row"}
                          spacing={2}
                        >
                          <Stack
                            className={mainClassName + "-list-number-wrapper"}
                          >
                            <Typography
                              className={mainClassName + "-list-number"}
                            >
                              {"0" + (index + 1)}
                            </Typography>
                            <ImageHandler
                              className={mainClassName + "-list-number-icon"}
                              src={require("@/images/icon/icon-number-point.svg")}
                              alt={
                                locale(currentHead?.title) + " " + (index + 1)
                              }
                            />
                          </Stack>
                          <Stack spacing={1}>
                            <Typography
                              className={
                                mainClassName +
                                "-list-item-text title " +
                                Helpers.fontZH()
                              }
                            >
                              {locale(item?.title)}
                            </Typography>
                            <Typography
                              className={
                                mainClassName +
                                "-list-item-text subtitle " +
                                Helpers.fontZH()
                              }
                            >
                              {locale(item?.description)}
                            </Typography>
                          </Stack>
                        </Stack>
                      </Stack>
                    );
                  })}
                </Stack>
              </Stack>

              <ImageHandler
                className={mainClassName + "-illustration"}
                src={currentHead?.illustration?.src}
                alt={locale(currentHead?.title) + " Illustration "}
                width={1200}
                height={1200}
                quality={100}
                overridePercent={"contain"}
              />
            </Stack>
          </Stack>
        </Stack>
      </Stack>
    );
  }
}

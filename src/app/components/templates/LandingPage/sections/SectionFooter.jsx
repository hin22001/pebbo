import React, { Component } from "react";
import { Stack, Typography } from "@mui/material";
import AnimationWrapper from "@/elements/animation/AnimationWrapper";
import Button from "@/elements/button/Button";
import IconCustom from "@/elements/icon/IconCustom";
import { locale } from "@/src/app/data/locale";
import LinkWrapper from "@/modules/link/LinkWrapper";
import { withAppRouter } from "@/app/utils/withAppRouter";

class index extends Component {
  constructor(props) {
    super(props);

    this.state = {
      mainClassName: "template-landing-page-section-footer",
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
      props: { head },
    } = this;

    return (
      <Stack component={"section"} className={mainClassName}>
        <Stack className={"container wide"}>
          <Stack className={mainClassName + "-content section-content"}>
            <Stack className={mainClassName + "-main-content"}>
              <AnimationWrapper
                animationTrue="animate__fadeInUp"
                animationFalse="animate__fadeOutDown"
              >
                <Stack
                  alignItems={"center"}
                  justifyContent={"center"}
                  className={mainClassName + "-wrap-content "}
                >
                  <Stack
                    className={mainClassName + "-list list-button"}
                    component={"ul"}
                    direction={"row"}
                    spacing={1}
                  >
                    {head?.sectionFooter?.listButton?.map((item, index) => {
                      return (
                        <Stack
                          component={"li"}
                          key={mainClassName + "-list-item-" + index}
                          className={mainClassName + "-list-item "}
                          // data-aos="fade-left"
                        >
                          <Button {...(item || {})} theme="white-pills" />
                        </Stack>
                      );
                    })}
                  </Stack>
                  <div id="contact-us">
                    {(() => {
                      const listItems = [];
                      const socialItems = [];

                      head?.sectionFooter?.listLink?.forEach((item, index) => {
                        const linkItem = (
                          <LinkWrapper
                            key={mainClassName + "-list-item-" + index}
                            className={mainClassName + "-list-item "}
                            externalHref={item?.href}
                            component={"li"}
                            target="_blank"
                          >
                            {item?.icon && <IconCustom icon={item?.icon} />}
                            {item?.label && (
                              <Typography>{locale(item?.label)}</Typography>
                            )}
                          </LinkWrapper>
                        );

                        if (
                          item?.icon === "linkedin" ||
                          item?.icon === "instagram" ||
                          item?.icon === "facebook"
                        ) {
                          socialItems.push(linkItem);
                        } else {
                          listItems.push(linkItem);
                        }
                      });

                      return (
                        <>
                          <Stack
                            className={mainClassName + "-list "}
                            component={"ul"}
                          >
                            {listItems}
                          </Stack>

                          <Stack
                            className={mainClassName + "-social-list "}
                            justifyContent={"center"}
                            gap={"2px"}
                            margin={"unset"}
                            flexDirection={"row"}
                            component={"ul"}
                          >
                            {socialItems}
                          </Stack>
                        </>
                      );
                    })()}
                  </div>
                </Stack>
              </AnimationWrapper>
            </Stack>
          </Stack>
        </Stack>
      </Stack>
    );
  }
}

export default withAppRouter(index);

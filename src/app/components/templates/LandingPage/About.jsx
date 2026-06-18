import React, { Component } from "react";
import { Stack, Typography } from "@mui/material";
import { SectionHeader, SectionFooter } from "./sections";
import { ImageHandler, Skeleton } from "@/elements";

import Image from "next/image";
import { locale } from "../../../data/locale";
import PageHead from "../../layouts/PageHead/PageHead";
import row1Image from "@/images/illustration/illustration-about-banner.svg";
import icoHkstp from "@/images/icon/icon-hkstp.svg";
import icoUst from "@/images/icon/icon-ust.svg";
import icoUstPng from "@/images/icon/icon-ust.png";
import footer1 from "@/images/illustration/illustration-about-footer-1.svg";
import footer2 from "@/images/illustration/illustration-about-footer-2.svg";
import { withAppRouter } from "@/app/utils/withAppRouter";

class index extends Component {
  constructor(props) {
    super(props);

    this.state = {
      mainClassName: "template-landing-page",
      slideActive: 1,
      screenWidth: 1400,
      tabActive: 1,
    };
  }

  changeSlide(next) {
    const { slideActive } = this.state;

    const data = [
      "@/images/illustration/illustration-about-slide-1.svg",
      "@/images/illustration/illustration-about-slide-2.svg",
      "@/images/illustration/illustration-about-slide-3.svg",
      "@/images/illustration/illustration-about-slide-4.svg",
    ];

    if (next && data?.length >= slideActive + 1) {
      this.setState({ slideActive: slideActive + 1 });
    } else if (!next && slideActive - 1 > 0) {
      this.setState({ slideActive: slideActive - 1 });
    }
  }

  handleResize = () => {
    const newWidth = window.innerWidth;
    this.setState({ screenWidth: newWidth });
  };

  async componentDidMount() {
    this.handleResize();
    window.addEventListener("resize", this.handleResize);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.handleResize);
  }

  render() {
    const {
      state: { mainClassName, slideActive, screenWidth, tabActive },
      props: { head },
    } = this;

    const dataTab = [1, 2, 3, 4, 5, 6];
    const dataChild = head?.about?.row4?.[tabActive - 1]?.data;
    const dataP = [
      "1",
      "2",
      "3",
      "1",
      "2",
      "3",
      "1",
      "2",
      "3",
      "1",
      "2",
      "3",
      "1",
      "2",
      "3",
    ];

    return (
      <>
        <PageHead
          customTitle={head?.meta?.title}
          seo={{
            meta: {
              title: head?.meta?.title,
              description: head?.meta?.description,
            },
          }}
        />
        <Stack component={"main"} className={mainClassName}>
          <Stack className={mainClassName + "-content"}>
            {head ? (
              <>
                <SectionHeader head={head} active="about" />
                <Stack className={mainClassName + "-outer"}>
                  <Stack className={mainClassName + "-wrapper"}>
                    <Stack className={mainClassName + "-about"}>
                      <Stack className={mainClassName + "-about-row1"}>
                        <Stack className={mainClassName + "-about-row1-left"}>
                          <Typography
                            className={mainClassName + "-about-row1-left-title"}
                          >
                            {locale(head?.about?.row1?.title)}
                          </Typography>
                          <Typography
                            className={
                              mainClassName + "-about-row1-left-subTitle"
                            }
                          >
                            {locale(head?.about?.row1?.subTitle)}
                          </Typography>
                          <Stack
                            className={
                              mainClassName + "-about-row1-left-btn-wrapper"
                            }
                          >
                            <Stack
                              onClick={() => this.props.router.push("/signup")}
                              className={mainClassName + "-about-row1-left-btn"}
                            >
                              <Typography
                                className={
                                  mainClassName + "-about-row1-left-btn-txt"
                                }
                              >
                                {locale(head?.about?.row1?.freeTrial)}
                              </Typography>
                            </Stack>
                            <Typography
                              className={
                                mainClassName + "-about-row1-left-btn-desc"
                              }
                            >
                              {locale(head?.about?.row1?.designedFor)}
                            </Typography>
                          </Stack>
                        </Stack>
                        {/* <Stack className={mainClassName + '-about-row1-right'} sx={{
                            background: `url(${row1Image.src})`
                          }} /> */}
                      </Stack>
                      <Stack className={mainClassName + "-about-row2"}>
                        <Typography
                          className={mainClassName + "-about-row2-title"}
                        >
                          {locale(head?.about?.row2?.title)}
                        </Typography>
                        <Stack
                          className={mainClassName + "-about-row2-content"}
                        >
                          <Stack
                            className={
                              mainClassName + "-about-row2-content-child"
                            }
                          >
                            <Typography
                              className={
                                mainClassName +
                                "-about-row2-content-child-title"
                              }
                            >
                              {locale(head?.about?.row2?.child1)}
                            </Typography>
                            <Stack
                              className={"affiliation-img"}
                              sx={{
                                background: `url(${icoHkstp.src})`,
                              }}
                            />
                          </Stack>
                          <Stack
                            className={
                              mainClassName + "-about-row2-content-child"
                            }
                          >
                            <Typography
                              className={
                                mainClassName +
                                "-about-row2-content-child-title"
                              }
                            >
                              {locale(head?.about?.row2?.child2)}
                            </Typography>
                            <Stack
                              className={"affiliation-img"}
                              sx={{
                                background: `url(${icoUstPng.src})`,
                              }}
                            />
                          </Stack>
                        </Stack>
                      </Stack>
                      <Stack className={mainClassName + "-about-row3"}>
                        <Typography
                          className={mainClassName + "-about-row3-title"}
                        >
                          {locale(head?.about?.row3?.title)}
                        </Typography>
                        <Typography
                          className={mainClassName + "-about-row3-desc"}
                          dangerouslySetInnerHTML={{
                            __html: locale(head?.about?.row3?.desc),
                          }}
                        />

                        <Stack className={mainClassName + "-about-row3-slider"}>
                          <Stack
                            onClick={() => this.changeSlide(false)}
                            className={
                              mainClassName + "-about-row3-slider-btn-left"
                            }
                          >
                            <Image
                              alt="img"
                              width={screenWidth > 600 ? 80 : 30}
                              src={require("@/images/icon/icon-about-slide-prev.svg")}
                            />
                          </Stack>
                          <Stack
                            className={"about-slide-image"}
                            sx={{
                              background: `url(${`/images/illustration/illustration-about-slide-${slideActive}.svg`})`,
                              height: "100%",
                            }}
                          />
                          <Stack
                            onClick={() => this.changeSlide(true)}
                            className={
                              mainClassName + "-about-row3-slider-btn-right"
                            }
                          >
                            <Image
                              alt="img"
                              width={screenWidth > 600 ? 80 : 30}
                              src={require("@/images/icon/icon-about-slide-next.svg")}
                            />
                          </Stack>
                        </Stack>

                        <Stack
                          className={mainClassName + "-about-row3-content"}
                        >
                          <Stack
                            className={
                              mainClassName + "-about-row3-content-card"
                            }
                          >
                            <Typography
                              className={
                                mainClassName + "-about-row3-content-card-title"
                              }
                            >
                              {locale(head?.about?.row3?.card1?.title)}
                            </Typography>
                            <Typography
                              className={
                                mainClassName + "-about-row3-content-card-desc"
                              }
                            >
                              {locale(head?.about?.row3?.card1?.desc)}
                            </Typography>
                          </Stack>
                          <Stack
                            className={
                              mainClassName + "-about-row3-content-card"
                            }
                          >
                            <Typography
                              className={
                                mainClassName + "-about-row3-content-card-title"
                              }
                            >
                              {locale(head?.about?.row3?.card2?.title)}
                            </Typography>
                            <Typography
                              className={
                                mainClassName + "-about-row3-content-card-desc"
                              }
                            >
                              {locale(head?.about?.row3?.card2?.desc)}
                            </Typography>
                          </Stack>
                          <Stack
                            className={
                              mainClassName + "-about-row3-content-card"
                            }
                          >
                            <Typography
                              className={
                                mainClassName + "-about-row3-content-card-title"
                              }
                            >
                              {locale(head?.about?.row3?.card3?.title)}
                            </Typography>
                            <Typography
                              className={
                                mainClassName + "-about-row3-content-card-desc"
                              }
                            >
                              {locale(head?.about?.row3?.card3?.desc)}
                            </Typography>
                          </Stack>
                        </Stack>
                        <Typography
                          className={mainClassName + "-about-row3-bottom-title"}
                        >
                          {locale(head?.about?.row3?.bottom?.title)}
                        </Typography>
                        <Stack
                          onClick={() => this.props.router.push("/contact")}
                          className={mainClassName + "-about-row3-bottom-btn"}
                        >
                          <Typography
                            className={
                              mainClassName + "-about-row3-bottom-btn-txt"
                            }
                          >
                            {locale(head?.about?.row3?.bottom?.desc)}
                          </Typography>
                        </Stack>
                      </Stack>

                      <Stack className={mainClassName + "-about-row4"}>
                        <Stack className={mainClassName + "-about-row4-tab"}>
                          {dataTab?.map((val, i) => (
                            <Stack
                              onClick={() => this.setState({ tabActive: val })}
                              key={i}
                              className={
                                mainClassName +
                                `-about-row4-tab-${tabActive === val ? "" : "in"}active`
                              }
                            >
                              <Typography
                                className={
                                  mainClassName +
                                  `-about-row4-tab-${tabActive === val ? "" : "in"}active-txt`
                                }
                              >
                                P{val}
                              </Typography>
                            </Stack>
                          ))}
                        </Stack>
                        <Stack className={mainClassName + "-about-row4-card"}>
                          <Stack
                            className={
                              mainClassName + "-about-row4-card-content"
                            }
                          >
                            <Stack
                              className={
                                mainClassName +
                                "-about-row4-card-content-column"
                              }
                            >
                              {dataChild
                                ?.slice(
                                  0,
                                  screenWidth > 500
                                    ? Math.ceil(dataChild?.length / 2)
                                    : dataChild?.length,
                                )
                                ?.map((val, i) => (
                                  <Stack
                                    key={i}
                                    className={
                                      mainClassName +
                                      "-about-row4-card-content-row"
                                    }
                                  >
                                    <Typography
                                      className={
                                        mainClassName +
                                        "-about-row4-card-content-row-txt"
                                      }
                                    >
                                      {i + 1}. {locale(val)}
                                    </Typography>
                                  </Stack>
                                ))}
                            </Stack>
                            {screenWidth > 500 && (
                              <Stack
                                className={
                                  mainClassName +
                                  "-about-row4-card-content-column"
                                }
                              >
                                {dataChild
                                  ?.slice(Math.ceil(dataChild?.length / 2))
                                  ?.map((val, i) => (
                                    <Stack
                                      key={i}
                                      className={
                                        mainClassName +
                                        "-about-row4-card-content-row"
                                      }
                                    >
                                      <Typography
                                        className={
                                          mainClassName +
                                          "-about-row4-card-content-row-txt"
                                        }
                                      >
                                        {Math.ceil(dataChild?.length / 2) +
                                          (i + 1)}
                                        . {locale(val)}
                                      </Typography>
                                    </Stack>
                                  ))}
                              </Stack>
                            )}
                          </Stack>
                        </Stack>
                      </Stack>

                      <Stack className={mainClassName + "-about-row5"}>
                        <Stack
                          className={mainClassName + "-about-row5-img-wrapper"}
                        >
                          <Stack
                            className={"about-bottom-img"}
                            sx={{
                              background: `url(${footer1.src})`,
                            }}
                          />
                          <Stack
                            className={"about-bottom-img"}
                            sx={{
                              background: `url(${footer2.src})`,
                            }}
                          />
                        </Stack>
                        <Stack
                          className={mainClassName + "-about-row5-content"}
                        >
                          <Typography
                            className={
                              mainClassName + "-about-row5-content-title"
                            }
                            dangerouslySetInnerHTML={{
                              __html: locale(head?.about?.row5?.title),
                            }}
                          />
                          <Typography
                            className={
                              mainClassName + "-about-row5-content-desc"
                            }
                            dangerouslySetInnerHTML={{
                              __html: locale(head?.about?.row5?.desc),
                            }}
                          />
                          <Stack
                            className={
                              mainClassName + "-about-row5-content-btn-wrapper"
                            }
                          >
                            <Stack
                              onClick={() => this.props.router.push("/contact")}
                              className={
                                mainClassName + "-about-row5-content-btn"
                              }
                            >
                              <Typography
                                className={
                                  mainClassName + "-about-row5-content-btn-txt"
                                }
                              >
                                {locale(head?.about?.row5?.btn)}
                              </Typography>
                            </Stack>
                            <Typography
                              className={
                                mainClassName + "-about-row5-content-btn-desc"
                              }
                            >
                              {locale(head?.about?.row5?.btnDesc)}
                            </Typography>
                          </Stack>
                        </Stack>
                      </Stack>
                    </Stack>
                  </Stack>
                </Stack>
                <Stack className={mainClassName + "-about-row3-buble"}>
                  <Image
                    alt="img"
                    width={screenWidth}
                    src={require("@/images/illustration/illustration-about-buble-2.svg")}
                  />
                </Stack>
                <Stack className={mainClassName + "-about-row5-buble"}>
                  <Image
                    alt="img"
                    width={screenWidth}
                    src={require("@/images/illustration/illustration-about-buble-3.svg")}
                  />
                </Stack>
                <Stack style={{ width: "100vw" }} />
                <SectionFooter head={head} />
              </>
            ) : (
              <Stack
                position={"fixed"}
                width="100%"
                height="100%"
                left={0}
                top={0}
                alignItems={"center"}
                justifyContent={"center"}
              >
                <Image
                  src={require("@/images/animation/animation-spinner.gif")}
                  width={200}
                  height={200}
                  alt="Loader Animation"
                  unoptimized
                />
              </Stack>
            )}
          </Stack>
        </Stack>
      </>
    );
  }
}

export default withAppRouter(index);

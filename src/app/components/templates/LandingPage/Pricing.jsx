import React, { Component } from "react";
import { getDataHead } from "@/src/app/data/head";
import { Stack, Typography } from "@mui/material";
import { SectionHeader, SectionFooter } from "./sections";

import Image from "next/image";
import { locale } from "../../../data/locale";
import PageHead from "../../layouts/PageHead/PageHead";
import illustration from "@/images/illustration/illustration-pricing.png";
import illustrationAfternoon from "@/images/illustration/illustration-afternoon.svg";
import { withAppRouter } from "@/app/utils/withAppRouter";

class index extends Component {
  constructor(props) {
    super(props);

    this.state = {
      mainClassName: "template-landing-page",
      imageWidth: 800,
      plan: 1,
    };
  }

  handleResize = () => {
    const screenWidth = window.innerWidth;
    const newWidth = screenWidth * 0.9;
    this.setState({ imageWidth: newWidth });
  };

  async componentDidMount() {
    const headSignIn = getDataHead({
      name: "headFormSignIn",
    });
    this.setState({ head2: headSignIn });
    this.handleResize();
    window.addEventListener("resize", this.handleResize);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.handleResize);
  }

  render() {
    const {
      state: { mainClassName, imageWidth, head2, plan },
      props: { head },
    } = this;

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
                <SectionHeader head={head} active="pricing" />
                <Stack className={mainClassName + "-outer"}>
                  <Stack className={mainClassName + "-wrapper"}>
                    <Stack className={mainClassName + "-pricing"}>
                      <Stack
                        className={mainClassName + "-pricing-row1-wrapper"}
                      >
                        <Stack className={mainClassName + "-pricing-row1"}>
                          <Typography
                            className={mainClassName + "-pricing-row1-title"}
                          >
                            {locale(head?.pricing?.row1?.title)}
                          </Typography>
                          <Typography
                            className={
                              mainClassName + "-pricing-row1-subtTitle"
                            }
                          >
                            {locale(head?.pricing?.row1?.subTitle)}
                          </Typography>
                          <Stack
                            className={
                              mainClassName + "-pricing-row1-btn-wrapper"
                            }
                          >
                            <Stack
                              onClick={() => this.props.router.push("/signup")}
                              className={mainClassName + "-pricing-row1-btn"}
                            >
                              <Typography
                                className={
                                  mainClassName + "-pricing-row1-btn-txt"
                                }
                              >
                                {locale(head?.pricing?.row1?.btn)}
                              </Typography>
                            </Stack>
                            <Typography
                              className={
                                mainClassName + "-pricing-row1-btn-desc"
                              }
                            >
                              {locale(head?.pricing?.row1?.btnDesc)}
                            </Typography>
                          </Stack>
                        </Stack>

                        <Stack
                          className={mainClassName + "-pricing-row1-image"}
                          sx={{
                            backgroundImage: `url(${illustration.src})`,
                          }}
                        ></Stack>

                        {/* <Stack className={mainClassName + '-pricing-row1-image'}> */}
                        {/* <Image alt='img' width={imageWidth} src={require('@/images/illustration/illustration-pricing.png')} /> */}
                        {/* </Stack> */}
                      </Stack>

                      <Typography
                        className={mainClassName + "-pricing-row2-title"}
                        dangerouslySetInnerHTML={{
                          __html: locale(head?.pricing?.row2?.title),
                        }}
                      />

                      <Stack className={mainClassName + "-pricing-subscribe"}>
                        <Stack
                          className={
                            mainClassName + "-pricing-subscribe-mobile"
                          }
                          width={"95%"}
                        >
                          <Stack>
                            <Stack
                              className={
                                mainClassName + "-pricing-subscribe-plan"
                              }
                            >
                              <Stack
                                className={
                                  mainClassName +
                                  `-pricing-subscribe-plan-${plan === 1 ? "active1" : "inactive"}`
                                }
                                onClick={() => this.setState({ plan: 1 })}
                              >
                                <Typography
                                  className={
                                    mainClassName +
                                    `-pricing-subscribe-plan-txt-${plan === 1 ? "active" : "inactive"}`
                                  }
                                >
                                  {locale(head2?.subscribe?.annually)}
                                </Typography>
                              </Stack>
                              <Stack
                                className={
                                  mainClassName +
                                  `-pricing-subscribe-plan-${plan === 2 ? "active2" : "inactive"}`
                                }
                                onClick={() => this.setState({ plan: 2 })}
                              >
                                <Typography
                                  className={
                                    mainClassName +
                                    `-pricing-subscribe-plan-txt-${plan === 2 ? "active" : "inactive"}`
                                  }
                                >
                                  {locale(head2?.subscribe?.monthly)}
                                </Typography>
                              </Stack>
                            </Stack>

                            <Stack
                              className={
                                mainClassName +
                                "-pricing-subscribe-plan-content"
                              }
                            >
                              <Stack
                                className={
                                  mainClassName +
                                  `-pricing-subscribe-plan-content-wrapper${plan === 1 ? "-outer1" : "-outer2"}`
                                }
                              >
                                <Typography
                                  className={
                                    mainClassName +
                                    "-pricing-subscribe-plan-content-wrapper-title"
                                  }
                                  dangerouslySetInnerHTML={{
                                    __html: locale(head?.pricing?.row3?.title),
                                  }}
                                />
                                <Stack
                                  className={
                                    mainClassName +
                                    "-pricing-subscribe-plan-content-wrapper-inner"
                                  }
                                >
                                  <Stack
                                    className={
                                      mainClassName +
                                      `-pricing-subscribe-plan-content-wrapper-card-${plan}`
                                    }
                                  >
                                    <Stack
                                      className={
                                        mainClassName +
                                        "-pricing-subscribe-plan-content-wrapper-card-inner"
                                      }
                                    >
                                      <Stack>
                                        <Typography
                                          className={
                                            mainClassName +
                                            "-pricing-subscribe-plan-content-wrapper-card-txt"
                                          }
                                          fontStyle="italic"
                                          fontWeight={400}
                                        >
                                          {locale(head2?.subscribe?.now)}
                                        </Typography>
                                        <Typography
                                          className={
                                            mainClassName +
                                            "-pricing-subscribe-plan-content-wrapper-card-txt"
                                          }
                                          fontStyle="italic"
                                          color={
                                            plan === 2 ? "#8264FF" : "#FF5000"
                                          }
                                          fontWeight={400}
                                          sx={{
                                            textDecoration: "line-through",
                                          }}
                                        >
                                          HKD {plan === 2 ? "$149" : "$1140"}
                                        </Typography>
                                        <Typography
                                          className={
                                            mainClassName +
                                            "-pricing-subscribe-plan-content-wrapper-card-txt"
                                          }
                                          fontStyle="italic"
                                          fontWeight={600}
                                          mb={1}
                                        >
                                          HKD {plan === 2 ? "$89" : "488"}
                                        </Typography>
                                      </Stack>
                                      <Typography
                                        className={
                                          mainClassName +
                                          "-pricing-subscribe-plan-content-wrapper-card-txt3"
                                        }
                                        fontStyle="italic"
                                        fontWeight={600}
                                      >
                                        {plan === 2 ? "30" : "365"}{" "}
                                        {locale(head2?.subscribe?.days)}{" "}
                                        <span style={{ fontWeight: 400 }}>
                                          {locale(head2?.subscribe?.for)}
                                        </span>{" "}
                                        <span style={{ fontStyle: "normal" }}>
                                          {plan === 2 ? "$89" : "488"}
                                        </span>
                                      </Typography>
                                      <Typography
                                        className={
                                          mainClassName +
                                          "-pricing-subscribe-plan-content-wrapper-card-txt"
                                        }
                                        fontStyle="italic"
                                      >
                                        {locale(head2?.subscribe?.just)}{" "}
                                        <span style={{ fontWeight: "bold" }}>
                                          {plan === 2 ? "$3" : "$1.3"}
                                        </span>{" "}
                                        {locale(head2?.subscribe?.perDay)}
                                      </Typography>
                                      <Stack>
                                        <Stack
                                          onClick={() =>
                                            this.props.router.push("/signup")
                                          }
                                          backgroundColor={
                                            plan === 2 ? "#8264FF" : "#FF5000"
                                          }
                                          className={
                                            mainClassName +
                                            "-pricing-subscribe-plan-content-wrapper-card-btn"
                                          }
                                        >
                                          <Typography
                                            className={
                                              mainClassName +
                                              "-pricing-subscribe-plan-content-wrapper-card-btn-txt"
                                            }
                                          >
                                            {locale(head?.pricing?.row3?.btn)}
                                          </Typography>
                                        </Stack>
                                        <Typography
                                          className={
                                            mainClassName +
                                            "-pricing-subscribe-plan-content-wrapper-card-txt2"
                                          }
                                          color={
                                            plan === 2 ? "#8264FF" : "#FF5000"
                                          }
                                        >
                                          (
                                          {locale(
                                            head2?.subscribe?.cancellation,
                                          )}
                                          )
                                        </Typography>
                                      </Stack>
                                    </Stack>
                                  </Stack>
                                  <Stack
                                    className={`pricing-image-wrapper ${plan === 1 ? "annually" : "monthly"}`}
                                  >
                                    <Stack
                                      className={`pricing-image`}
                                      sx={{
                                        background: `url(/images/illustration/illustration-pricing-${plan === 1 ? "annually" : "monthly"}.jpg)`,
                                      }}
                                    />
                                  </Stack>
                                </Stack>
                              </Stack>
                            </Stack>
                          </Stack>
                        </Stack>
                      </Stack>

                      <Stack className={mainClassName + "-pricing-row4"}>
                        <Typography
                          className={mainClassName + "-pricing-row4-title"}
                          dangerouslySetInnerHTML={{
                            __html: locale(head?.pricing?.row4?.title),
                          }}
                        />
                        <Stack
                          className={
                            mainClassName + "-pricing-row4-content-wrapper"
                          }
                        >
                          <Stack
                            className={"bg-img-center afternoon-img-mobile"}
                            sx={{
                              background: `url(${illustrationAfternoon.src})`,
                              height: "100%",
                              width: "100%",
                            }}
                          />
                          <Stack
                            className={mainClassName + "-pricing-row4-content"}
                          >
                            <Stack
                              className={
                                mainClassName +
                                "-pricing-row4-content-row " +
                                mainClassName +
                                "-pricing-row4-content-row-red"
                              }
                            >
                              <Stack
                                className={
                                  mainClassName +
                                  "-pricing-row4-content-row-left"
                                }
                              >
                                <Image
                                  alt="img"
                                  width={imageWidth > 600 ? 65 : 35}
                                  src={require("@/images/icon/icon-todo-1.svg")}
                                />
                                <Stack
                                  className={
                                    mainClassName +
                                    "-pricing-row4-content-row-center"
                                  }
                                >
                                  <Typography
                                    className={
                                      mainClassName +
                                      "-pricing-row4-content-row-center-title"
                                    }
                                  >
                                    {locale(head?.pricing?.row4?.row1)}
                                  </Typography>
                                  <Stack
                                    className={
                                      mainClassName +
                                      "-pricing-row4-content-row-center-desc"
                                    }
                                  >
                                    <Stack
                                      className={
                                        mainClassName +
                                        "-pricing-row4-content-row-center-desc-icon"
                                      }
                                    >
                                      <Image
                                        alt="img"
                                        width={imageWidth > 600 ? 28 : 15}
                                        src={require("@/images/icon/icon-time.svg")}
                                      />
                                      <Typography
                                        className={
                                          mainClassName +
                                          "-pricing-row4-content-row-center-desc-txt"
                                        }
                                      >
                                        {locale(head?.pricing?.row4?.rowNow)}
                                      </Typography>
                                    </Stack>
                                    <Stack
                                      className={
                                        mainClassName +
                                        "-pricing-row4-content-row-center-desc-icon"
                                      }
                                    >
                                      <Image
                                        alt="img"
                                        width={imageWidth > 600 ? 28 : 15}
                                        src={require("@/images/icon/icon-point-coin.png")}
                                      />
                                      <Typography
                                        className={
                                          mainClassName +
                                          "-pricing-row4-content-row-center-desc-txt"
                                        }
                                      >
                                        {locale(head?.pricing?.row4?.rowHkd)}
                                      </Typography>
                                    </Stack>
                                  </Stack>
                                </Stack>
                              </Stack>
                              <Stack>
                                <Image
                                  alt="img"
                                  width={imageWidth > 600 ? 35 : 25}
                                  src={require("@/images/icon/icon-todo-ticked-orange.svg")}
                                />
                              </Stack>
                            </Stack>
                            <Stack
                              className={
                                mainClassName +
                                "-pricing-row4-content-row " +
                                mainClassName +
                                "-pricing-row4-content-row-green"
                              }
                            >
                              <Stack
                                className={
                                  mainClassName +
                                  "-pricing-row4-content-row-left"
                                }
                              >
                                <Image
                                  alt="img"
                                  width={imageWidth > 600 ? 65 : 35}
                                  src={require("@/images/icon/icon-todo-2.svg")}
                                />
                                <Stack
                                  className={
                                    mainClassName +
                                    "-pricing-row4-content-row-center"
                                  }
                                >
                                  <Typography
                                    className={
                                      mainClassName +
                                      "-pricing-row4-content-row-center-title"
                                    }
                                  >
                                    {locale(head?.pricing?.row4?.row2)}
                                  </Typography>
                                  <Stack
                                    className={
                                      mainClassName +
                                      "-pricing-row4-content-row-center-desc"
                                    }
                                  >
                                    <Stack
                                      className={
                                        mainClassName +
                                        "-pricing-row4-content-row-center-desc-icon"
                                      }
                                    >
                                      <Image
                                        alt="img"
                                        width={imageWidth > 600 ? 28 : 15}
                                        src={require("@/images/icon/icon-time.svg")}
                                      />
                                      <Typography
                                        className={
                                          mainClassName +
                                          "-pricing-row4-content-row-center-desc-txt"
                                        }
                                      >
                                        {locale(head?.pricing?.row4?.rowNow)}
                                      </Typography>
                                    </Stack>
                                    <Stack
                                      className={
                                        mainClassName +
                                        "-pricing-row4-content-row-center-desc-icon"
                                      }
                                    >
                                      <Image
                                        alt="img"
                                        width={imageWidth > 600 ? 28 : 15}
                                        src={require("@/images/icon/icon-point-coin.png")}
                                      />
                                      <Typography
                                        className={
                                          mainClassName +
                                          "-pricing-row4-content-row-center-desc-txt"
                                        }
                                      >
                                        {locale(head?.pricing?.row4?.rowHkd)}
                                      </Typography>
                                    </Stack>
                                  </Stack>
                                </Stack>
                              </Stack>
                              <Stack>
                                <Image
                                  alt="img"
                                  width={imageWidth > 600 ? 35 : 25}
                                  src={require("@/images/icon/icon-todo-ticked.png")}
                                />
                              </Stack>
                            </Stack>
                            <Stack
                              className={
                                mainClassName +
                                "-pricing-row4-content-row " +
                                mainClassName +
                                "-pricing-row4-content-row-purple"
                              }
                            >
                              <Stack
                                className={
                                  mainClassName +
                                  "-pricing-row4-content-row-left"
                                }
                              >
                                <Image
                                  alt="img"
                                  width={imageWidth > 600 ? 65 : 35}
                                  src={require("@/images/icon/icon-todo-3.svg")}
                                />
                                <Stack
                                  className={
                                    mainClassName +
                                    "-pricing-row4-content-row-center"
                                  }
                                >
                                  <Typography
                                    className={
                                      mainClassName +
                                      "-pricing-row4-content-row-center-title"
                                    }
                                  >
                                    {locale(head?.pricing?.row4?.row3)}
                                  </Typography>
                                  <Stack
                                    className={
                                      mainClassName +
                                      "-pricing-row4-content-row-center-desc"
                                    }
                                  >
                                    <Stack
                                      className={
                                        mainClassName +
                                        "-pricing-row4-content-row-center-desc-icon"
                                      }
                                    >
                                      <Image
                                        alt="img"
                                        width={imageWidth > 600 ? 28 : 15}
                                        src={require("@/images/icon/icon-time.svg")}
                                      />
                                      <Typography
                                        className={
                                          mainClassName +
                                          "-pricing-row4-content-row-center-desc-txt"
                                        }
                                      >
                                        {locale(head?.pricing?.row4?.rowNow)}
                                      </Typography>
                                    </Stack>
                                    <Stack
                                      className={
                                        mainClassName +
                                        "-pricing-row4-content-row-center-desc-icon"
                                      }
                                    >
                                      <Image
                                        alt="img"
                                        width={imageWidth > 600 ? 28 : 15}
                                        src={require("@/images/icon/icon-point-coin.png")}
                                      />
                                      <Typography
                                        className={
                                          mainClassName +
                                          "-pricing-row4-content-row-center-desc-txt"
                                        }
                                      >
                                        {locale(head?.pricing?.row4?.rowHkd)}
                                      </Typography>
                                    </Stack>
                                  </Stack>
                                </Stack>
                              </Stack>
                              <Stack>
                                <Image
                                  alt="img"
                                  width={imageWidth > 600 ? 35 : 25}
                                  src={require("@/images/icon/icon-todo-ticked-purple.svg")}
                                />
                              </Stack>
                            </Stack>
                            <Stack
                              className={
                                mainClassName +
                                "-pricing-row4-content-row " +
                                mainClassName +
                                "-pricing-row4-content-row-yellow"
                              }
                            >
                              <Stack
                                className={
                                  mainClassName +
                                  "-pricing-row4-content-row-left"
                                }
                              >
                                <Image
                                  alt="img"
                                  width={imageWidth > 600 ? 65 : 35}
                                  src={require("@/images/icon/icon-todo-4.svg")}
                                />
                                <Stack
                                  className={
                                    mainClassName +
                                    "-pricing-row4-content-row-center"
                                  }
                                >
                                  <Typography
                                    className={
                                      mainClassName +
                                      "-pricing-row4-content-row-center-title"
                                    }
                                  >
                                    {locale(head?.pricing?.row4?.row4)}
                                  </Typography>
                                  <Stack
                                    className={
                                      mainClassName +
                                      "-pricing-row4-content-row-center-desc"
                                    }
                                  >
                                    <Stack
                                      className={
                                        mainClassName +
                                        "-pricing-row4-content-row-center-desc-icon"
                                      }
                                    >
                                      <Image
                                        alt="img"
                                        width={imageWidth > 600 ? 28 : 15}
                                        src={require("@/images/icon/icon-time.svg")}
                                      />
                                      <Typography
                                        className={
                                          mainClassName +
                                          "-pricing-row4-content-row-center-desc-txt"
                                        }
                                      >
                                        {locale(head?.pricing?.row4?.rowNow)}
                                      </Typography>
                                    </Stack>
                                    <Stack
                                      className={
                                        mainClassName +
                                        "-pricing-row4-content-row-center-desc-icon"
                                      }
                                    >
                                      <Image
                                        alt="img"
                                        width={imageWidth > 600 ? 28 : 15}
                                        src={require("@/images/icon/icon-point-coin.png")}
                                      />
                                      <Typography
                                        className={
                                          mainClassName +
                                          "-pricing-row4-content-row-center-desc-txt"
                                        }
                                      >
                                        {locale(head?.pricing?.row4?.rowHkd)}
                                      </Typography>
                                    </Stack>
                                  </Stack>
                                </Stack>
                              </Stack>
                              <Stack>
                                <Image
                                  alt="img"
                                  width={imageWidth > 600 ? 35 : 25}
                                  src={require("@/images/icon/icon-todo-ticked-yellow.svg")}
                                />
                              </Stack>
                            </Stack>
                            <Stack
                              className={
                                mainClassName +
                                "-pricing-row4-content-row " +
                                mainClassName +
                                "-pricing-row4-content-row-pink"
                              }
                            >
                              <Stack
                                className={
                                  mainClassName +
                                  "-pricing-row4-content-row-left"
                                }
                              >
                                <Image
                                  alt="img"
                                  width={imageWidth > 600 ? 65 : 35}
                                  src={require("@/images/icon/icon-book-math.svg")}
                                />
                                <Stack
                                  className={
                                    mainClassName +
                                    "-pricing-row4-content-row-center"
                                  }
                                >
                                  <Typography
                                    className={
                                      mainClassName +
                                      "-pricing-row4-content-row-center-title"
                                    }
                                  >
                                    {locale(head?.pricing?.row4?.row5)}
                                  </Typography>
                                  <Stack
                                    className={
                                      mainClassName +
                                      "-pricing-row4-content-row-center-desc"
                                    }
                                  >
                                    <Stack
                                      className={
                                        mainClassName +
                                        "-pricing-row4-content-row-center-desc-icon"
                                      }
                                    >
                                      <Image
                                        alt="img"
                                        width={imageWidth > 600 ? 28 : 15}
                                        src={require("@/images/icon/icon-time.svg")}
                                      />
                                      <Typography
                                        className={
                                          mainClassName +
                                          "-pricing-row4-content-row-center-desc-txt"
                                        }
                                      >
                                        {locale(head?.pricing?.row4?.rowNow)}
                                      </Typography>
                                    </Stack>
                                    <Stack
                                      className={
                                        mainClassName +
                                        "-pricing-row4-content-row-center-desc-icon"
                                      }
                                    >
                                      <Image
                                        alt="img"
                                        width={imageWidth > 600 ? 28 : 15}
                                        src={require("@/images/icon/icon-point-coin.png")}
                                      />
                                      <Typography
                                        className={
                                          mainClassName +
                                          "-pricing-row4-content-row-center-desc-txt"
                                        }
                                      >
                                        {locale(head?.pricing?.row4?.rowHkd)}
                                      </Typography>
                                    </Stack>
                                  </Stack>
                                </Stack>
                              </Stack>
                              <Stack>
                                <Image
                                  alt="img"
                                  width={imageWidth > 600 ? 35 : 25}
                                  src={require("@/images/icon/icon-todo-ticked-pink.svg")}
                                />
                              </Stack>
                            </Stack>
                          </Stack>
                        </Stack>
                      </Stack>

                      <Stack className={mainClassName + "-pricing-row5"}>
                        <Typography
                          className={mainClassName + "-pricing-row5-title"}
                          dangerouslySetInnerHTML={{
                            __html: locale(head?.pricing?.row5?.title),
                          }}
                        />
                        <Stack
                          onClick={() => this.props.router.push("/signup")}
                          className={mainClassName + "-pricing-row5-btn"}
                        >
                          <Typography
                            className={mainClassName + "-pricing-row5-btn-txt"}
                          >
                            {locale(head?.pricing?.row5?.btn)}
                          </Typography>
                        </Stack>
                        <Typography
                          className={mainClassName + "-pricing-row5-btn-desc"}
                        >
                          {locale(head?.pricing?.row5?.desc)}
                        </Typography>
                      </Stack>
                    </Stack>
                  </Stack>
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

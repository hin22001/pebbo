import React, { Component } from "react";
import { Stack, TextareaAutosize, TextField, Typography } from "@mui/material";
import { SectionHeader, SectionFooter } from "./sections";
import Image from "next/image";
import { locale } from "../../../data/locale";
import PageHead from "../../layouts/PageHead/PageHead";
import illustration from "@/images/illustration/illustration-contact-us.svg";
import bubble from "@/images/illustration/illustration-buble-contact-us.svg";

export default class Index extends Component {
  constructor(props) {
    super(props);

    this.state = {
      mainClassName: "template-landing-page",
      screenWidth: 1400,
      name: "",
      email: "",
      message: "",
    };
  }

  handleResize = () => {
    const screenWidth = window.innerWidth;
    this.setState({ screenWidth });
  };

  async componentDidMount() {
    this.handleResize();
    window.addEventListener("resize", this.handleResize);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.handleResize);
  }

  handleInputChange = (e) => {
    const { name, value } = e.target;
    this.setState({ [name]: value });
  };

  handleSendEmail = () => {
    const { name, email, message } = this.state;

    const mailtoLink = `mailto:hello@pebbo.io?subject=Contact%20Form%20Submission&body=Name:%20${encodeURIComponent(name)}%0AEmail:%20${encodeURIComponent(email)}%0AMessage:%20${encodeURIComponent(message)}`;

    // Trigger the mailto link
    window.location.href = mailtoLink;
  };

  render() {
    const {
      state: { mainClassName, screenWidth, name, email, message },
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
                <SectionHeader head={head} active="contact" />
                <Stack className={mainClassName + "-outer"}>
                  <Stack className={mainClassName + "-wrapper"}>
                    <Stack className={mainClassName + "-contact"}>
                      <Stack className={mainClassName + "-contact-content"}>
                        <Stack className={"contact-wrapper"}>
                          <Stack
                            className={mainClassName + "-contact-content-form"}
                          >
                            <Typography
                              className={
                                mainClassName + "-contact-content-form-title"
                              }
                            >
                              {locale(head?.contact?.title)}
                            </Typography>
                            <Typography
                              className={
                                mainClassName + "-contact-content-form-subTitle"
                              }
                            >
                              {locale(head?.contact?.subTitle)}
                            </Typography>

                            <TextField
                              className={
                                mainClassName + "-contact-content-form-input"
                              }
                              placeholder={locale(head?.contact?.name)}
                              name="name"
                              value={name}
                              onChange={this.handleInputChange}
                            />

                            <TextField
                              className={
                                mainClassName + "-contact-content-form-input"
                              }
                              placeholder={locale(head?.contact?.email)}
                              name="email"
                              value={email}
                              onChange={this.handleInputChange}
                            />

                            <TextareaAutosize
                              className={
                                mainClassName + "-contact-content-form-textarea"
                              }
                              placeholder={locale(head?.contact?.message)}
                              name="message"
                              value={message}
                              onChange={this.handleInputChange}
                            />

                            <Stack
                              className={
                                mainClassName + "-contact-content-form-btn"
                              }
                              onClick={this.handleSendEmail} // Trigger email on click
                              style={{ cursor: "pointer" }}
                            >
                              <Typography
                                className={
                                  mainClassName +
                                  "-contact-content-form-btn-txt"
                                }
                              >
                                {locale(head?.contact?.btn)}
                              </Typography>
                            </Stack>
                          </Stack>

                          <Stack
                            className={"bubble-image"}
                            sx={{
                              background: `url(${bubble.src})`,
                            }}
                          />
                        </Stack>

                        <Stack
                          className={"contact-img"}
                          sx={{
                            background: `url(${illustration.src})`,
                            height: "100%",
                            width: "100%",
                            backgroundPosition: "left",
                          }}
                        />
                      </Stack>
                    </Stack>
                  </Stack>
                </Stack>

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

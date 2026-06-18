import React, { Component } from "react";
import { getDataHead } from "@/src/app/data/head";
import { Stack } from "@mui/material";
import { ContentLayout } from "@/layouts/ContentLayout";
import {
  SectionHeader,
  SectionBanner,
  SectionPartners,
  SectionAbout,
  SectionVideo,
  SectionFeature,
  SectionGuide,
  SectionAmbassador,
  SectionFooter,
  SectionInstagram,
  SectionPlan,
} from "./sections";
import ImageHandler from "@/elements/image/ImageHandler";
import { Skeleton } from "@mui/material";

import Image from "next/image";
import AnimationWrapper from "@/elements/animation/AnimationWrapper";
import PageHead from "../../layouts/PageHead/PageHead";

export default class index extends Component {
  constructor(props) {
    super(props);

    this.state = {
      mainClassName: "template-landing-page",
      imageWidth: 1400,
      imageWidthChild: 725,
    };
  }

  async assignHead() {
    try {
      // const AOS = require('AOS')
    } catch (err) {}
  }

  handleResize = () => {
    const screenWidth = window.innerWidth;
    const newWidth = screenWidth * 0.9;
    const newWidthChild = screenWidth * 0.45;
    this.setState({ imageWidth: newWidth, imageWidthChild: newWidthChild });
  };

  async componentDidMount() {
    this.handleResize();
    window.addEventListener("resize", this.handleResize);
    await this.assignHead();
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.handleResize);
  }

  render() {
    const {
      state: { mainClassName, imageWidth, imageWidthChild },
      props: { head },
    } = this;

    return (
      // <ContentLayout
      //   customTitle={head?.meta?.title}
      //   theme='full light-grey disable-padding disable-border'
      //   hideTitle={true}
      //   access={true}
      //   overflow={true}
      //   seo={{
      //     meta: {
      //       title: head?.meta?.title,
      //       description: head?.meta?.description,
      //     }
      //   }}
      // >
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
          {head ? (
            <>
              <SectionHeader head={head} active="features" />

              <Stack className={mainClassName + "-outer"}>
                <Stack className={mainClassName + "-wrapper"}>
                  <SectionBanner
                    head={head}
                    imageWidth={imageWidth}
                    imageWidthChild={imageWidthChild}
                  />
                  <SectionInstagram head={head} />
                  <SectionFeature head={head} imageWidth={imageWidth} />
                  <SectionPlan head={head} />
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
      </>

      // </ContentLayout>
    );
  }
}

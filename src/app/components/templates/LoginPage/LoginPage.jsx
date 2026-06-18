"use client";
import React, { Component } from "react";
import Loader from "@/elements/loader/Loader";
import ContentLayout from "@/layouts/ContentLayout/ContentLayout";

import { FormSignIn } from "./sections";

export default class index extends Component {
  constructor(props) {
    super(props);

    this.state = {
      mainClassName: "template-login-page",
      title: "Login Page",
      activeScreen: "sign-in",
    };
  }
  async handleEvent(params) {
    try {
      switch (params?.type) {
        case "resend-verification-code":
        case "sign-in":
          {
            return this.props.postSignIn(params);
          }
          break;

        case "verification-code-submit":
          {
            return this.props.postVerificationCode(params);
          }
          break;
      }
    } catch (err) {}
  }

  async componentDidMount() {}

  render() {
    const {
      state: { mainClassName, title, activeScreen },
      props: { showLoader },
    } = this;

    return (
      <ContentLayout
        title={title}
        theme="full light-grey disable-padding disable-border"
        hideTitle={true}
        access={true}
      >
        <main className={mainClassName}>
          <Loader isOpen={showLoader} resetModal={true} />

          <FormSignIn handleEvent={this.handleEvent.bind(this)} />
        </main>
      </ContentLayout>
    );
  }
}

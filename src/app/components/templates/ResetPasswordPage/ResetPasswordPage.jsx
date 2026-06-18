"use client";
import React, { Component } from "react";
import Loader from "@/elements/loader/Loader";
import ContentLayout from "@/layouts/ContentLayout/ContentLayout";

import { FormResetPassword } from "./sections";

export default class index extends Component {
  constructor(props) {
    super(props);

    this.state = {
      mainClassName: "template-login-page",
      title: "Reset Password",
      activeScreen: "sign-in",
    };
  }
  async handleEvent(params) {
    try {
      // switch (params?.type) {
      //   case 'sign-up': {
      //     return this.props.postReset(params)
      //   } break
      // }
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

          <FormResetPassword handleEvent={this.handleEvent.bind(this)} />
        </main>
      </ContentLayout>
    );
  }
}

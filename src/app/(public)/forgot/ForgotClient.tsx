"use client";

import React, { Component } from "react";
import { Provider } from "react-redux";
import { legacy_createStore as createStore, applyMiddleware } from "redux";
import thunkMiddleware from "redux-thunk";
import reducers from "@/app/contexts/redux/reducers";
import { ForgotPage } from "@/app/components/templates";
import { LoginAPI } from "@/app/data/api";

// Isolated Redux store for auth pages
const authStore = createStore(reducers, applyMiddleware(thunkMiddleware));

class ForgotContainer extends Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = {
      showLoader: false,
    };
  }

  async openLoader() {
    await this.setState({ showLoader: true });
    setTimeout(async () => {
      await this.closeLoader();
    }, 15000);
  }

  async closeLoader() {
    await this.setState({ showLoader: false });
  }

  async postForgot(params: any) {
    try {
      await this.openLoader();
      const response: any = await LoginAPI.postForgot({}, params?.data);
      await this.closeLoader();
      return response;
    } catch (err) {
      await this.closeLoader();
    }
  }

  render() {
    return (
      <ForgotPage
        postForgot={this.postForgot.bind(this)}
        showLoader={this.state.showLoader}
      />
    );
  }
}

export default function ForgotClient() {
  return (
    <Provider store={authStore}>
      <ForgotContainer />
    </Provider>
  );
}

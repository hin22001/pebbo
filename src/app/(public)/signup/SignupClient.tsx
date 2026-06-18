"use client";

import React, { Component } from "react";
import { Provider } from "react-redux";
import { legacy_createStore as createStore, applyMiddleware } from "redux";
import thunkMiddleware from "redux-thunk";
import reducers from "@/app/contexts/redux/reducers";
import { SignUpPage } from "@/app/components/templates";
import { LoginAPI } from "@/app/data/api";
import { Auth } from "@/app/data/local";
import { Helpers } from "@/app/utils";

// Isolated Redux store for auth pages
const authStore = createStore(reducers, applyMiddleware(thunkMiddleware));

class SignupContainer extends Component<any, any> {
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

  async postSignUp(params: any) {
    try {
      await this.openLoader();

      const response: any = await LoginAPI.postSignUp({}, params?.data);

      if (response?.status === 200) {
        // Automatically log in the user after signup to establish session for onboarding
        await LoginAPI.postSignInPassword(
          {},
          {
            email: params.data.email,
            password: params.data.password,
          },
        );

        // Populate localStorage with user data so client-side auth checks pass
        await Auth.refreshCurrentUser();

        const user = Auth.getDataUser();
        const isStudentRole =
          user?.role?.id === "student" || user?.role?.name === "Student";
        if (isStudentRole && !user?.onboarding_completed) {
          window.location.replace(Helpers.hrefLocale("/onboarding/placement"));
        } else {
          window.location.replace(Helpers.hrefLocale("/dashboard"));
        }
      }

      await this.closeLoader();
      return response;
    } catch (err) {
      await this.closeLoader();
    }
  }

  async componentDidMount() {
    const user = Auth.getDataUser();
    if (user) {
      const isStudentRole =
        user?.role?.id === "student" || user?.role?.name === "Student";
      if (isStudentRole && !user?.onboarding_completed) {
        window.location.replace(Helpers.hrefLocale("/onboarding/placement"));
      } else {
        window.location.replace(Helpers.hrefLocale("/dashboard"));
      }
    }
    await this.closeLoader();
  }

  render() {
    return (
      <SignUpPage
        postSignUp={this.postSignUp.bind(this)}
        showLoader={this.state.showLoader}
      />
    );
  }
}

export default function SignupClient() {
  return (
    <Provider store={authStore}>
      <SignupContainer />
    </Provider>
  );
}

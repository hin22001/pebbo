"use client";

/**
 * LoginClient — client boundary for the Login Page.
 * Wraps the legacy login page component with its own Redux provider
 */
import React, { Component } from "react";
import { Provider, connect } from "react-redux";
import { legacy_createStore as createStore, applyMiddleware } from "redux";
import thunkMiddleware from "redux-thunk";
import reducers from "@/app/contexts/redux/reducers";
import { LoginPage } from "@/app/components/templates";
import { LoginAPI } from "@/app/data/api";
import { Auth, LocalData } from "@/app/data/local";
import {
  assignMainLayout,
  assignAuthentication,
} from "@/app/contexts/redux/actions";
import { Helpers } from "@/app/utils";
import nProgress from "nprogress";
import { getDataHead } from "@/src/app/data/head";
import UserAPI from "@/app/data/api/UserAPI";
import { getPostLoginPath } from "@/app/utils/getPostLoginPath";

// Isolated Redux store for auth pages
const authStore = createStore(reducers, applyMiddleware(thunkMiddleware));

class LoginContainer extends Component<any, any> {
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

  async updateDataUser(role: string, email: string, paying: boolean) {
    try {
      LocalData.removeData("tempEmail");
      LocalData.setData("modalTeacher", true);

      nProgress.start();
      let response = await LoginAPI.getStudentProfile();
      if (!response?.payload?.data) {
        response = await UserAPI.getProfile();
      }
      const profileName =
        response?.payload?.data?.first_name +
        " " +
        response?.payload?.data?.last_name;
      const role_ =
        role === "student"
          ? "Student"
          : role === "admin"
            ? "Admin"
            : role === "teacher"
              ? "Teacher"
              : role === "system_admin"
                ? "System Admin"
                : "Student";

      let refactorDataUser: any = {
        name: profileName?.length > 1 ? profileName : email?.split("@")[0],
        education_level: response?.payload?.data?.education_level,
        year: 2, // App rule: every logged-in user defaults to grade 2 (DB left unchanged)
        role: {
          id: role,
          name: role_,
        },
      };

      if (response?.payload?.status === 200) {
        refactorDataUser = {
          ...refactorDataUser,
          stars: response?.payload?.data?.stars || "0",
          profile_image: response?.payload?.data?.profile_image,
          paying: response?.payload?.data?.paying ?? false,
          onboarding_completed:
            response?.payload?.data?.onboarding_completed ?? false,
        };
      }

      Auth.setDataUser(refactorDataUser);
      nProgress.done();

      const onboardingDone = Boolean(refactorDataUser.onboarding_completed);

      const target = getPostLoginPath({ role, paying, onboardingDone });
      window.location.replace(Helpers.hrefLocale(target));
    } catch (err) {
      nProgress.done();
    }
  }

  async postVerificationCode(params: any) {
    try {
      nProgress.start();
      const email = LocalData.getData("tempEmail");
      const response = await LoginAPI.postConfirmOTP(
        {},
        {
          token: params?.value?.data?.code,
          type: "email",
          email: email,
        },
      );

      if (response.success) {
        await this.updateDataUser(
          response?.payload?.data?.role,
          email,
          response?.payload?.data?.paying,
        );

        return {
          message: response?.message,
          type: "success",
        };
      } else {
        nProgress.done();
        return {
          message: response?.message,
          type: "error",
        };
      }
    } catch (err) {
      nProgress.done();
    }
  }

  async postSignIn(params: any) {
    try {
      await this.openLoader();

      const email = params?.data?.email;
      const password = params?.data?.password;
      let response: any = null;

      if (password) {
        response = await LoginAPI.postSignInPassword(
          {},
          {
            email: email,
            password: password,
          },
        );
      } else {
        response = await LoginAPI.postSignIn(
          {},
          {
            email: email,
          },
        );
      }

      await this.closeLoader();

      if (response?.success) {
        if (password) {
          await this.updateDataUser(
            response?.payload?.data?.role,
            email,
            response?.payload?.data?.paying,
          );

          return {
            message: response?.message,
            type: "success",
          };
        } else {
          LocalData.setData("tempEmail", email);
          return getDataHead({ name: "headAlert" })?.checkEmail;
        }
      } else {
        return response;
      }
    } catch (err) {
      await this.closeLoader();
    }
  }

  async componentDidMount() {
    const user = Auth.getDataUser();
    if (user) {
      const target = getPostLoginPath({
        role: user?.role?.id,
        paying: (user as any)?.paying, // TODO: tighten user typing — see Phase 2.
        onboardingDone: user?.onboarding_completed,
      });
      window.location.replace(Helpers.hrefLocale(target));
    }
    await this.closeLoader();
  }

  render() {
    return (
      <LoginPage
        postSignIn={this.postSignIn.bind(this)}
        postVerificationCode={this.postVerificationCode.bind(this)}
        showLoader={this.state.showLoader}
      />
    );
  }
}

const ConnectedLogin = connect(null, {
  assignMainLayout,
  assignAuthentication,
})(LoginContainer);

export default function LoginClient() {
  return (
    <Provider store={authStore}>
      <ConnectedLogin />
    </Provider>
  );
}

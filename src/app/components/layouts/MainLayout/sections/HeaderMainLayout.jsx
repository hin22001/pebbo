"use client";
import React, { Component } from "react";
import Image from "next/image";
import Link from "next/link";
import { getLabel, locale } from "@/locale";

import { connect } from "react-redux";
import { assignMainLayout } from "@/app/contexts/redux/actions";

import { Navbar } from "../navbar";

import { getDataHead } from "@/app/data/head";
import { Auth } from "@/app/data/local";
import { withAppRouter } from "@/app/utils/withAppRouter";
import nProgress from "nprogress";
import { Helpers } from "@/src/app/utils";
import { Config } from "@/src/app/constant";
import { LinkWrapper } from "../../../modules";
import LoginAPI from "../../../../data/api/LoginAPI";
import { Announcement } from "../../../elements";
import { MoreVert } from "@mui/icons-material";
import UserAPI from "../../../../data/api/UserAPI";

class index extends Component {
  constructor(props) {
    super(props);

    this.state = {
      mainClassName: "main-layout-section-header",
      showUserDetail: false,
      showNavigation: true,
      loadingYear: false,
      dataSummary: false,
    };
  }

  async handleEvent(params) {
    try {
      switch (params?.type) {
        case "click-user-card":
          {
            this.setState({
              showUserDetail: params?.event?.currentTarget,
            });
          }
          break;

        case "click-user-card-close":
          {
            this.setState({
              showUserDetail: null,
            });

            switch (params?.id) {
              case "sign-out":
                {
                  nProgress.start();
                  await this.props.assignMainLayout({
                    type: "ASSIGN_OPEN_LOADER",
                  });

                  await Auth.logout();
                  nProgress.done();
                }
                break;

              case "profile":
                {
                  this.props.router.push("/dashboard/student-profile");
                }
                break;
            }
          }
          break;

        case "click-nav-action":
          {
            this.props.navAction({
              type: params?.type,
              showNavigation: true,
            });

            this.setState({
              showNavigation: true,
            });
          }
          break;

        case "event-profile":
          {
          }
          break;
      }
    } catch (err) {
      await this.props.assignMainLayout({
        type: "ASSIGN_CLOSE_LOADER",
      });
    }
  }

  onChangeYear = async (event) => {
    nProgress.start();
    this.setState({ loadingYear: true });

    const data = event?.target?.value;
    const dataUser = Auth.getDataUser();

    try {
      await LoginAPI.postSetContext(
        {},
        {
          education_level: dataUser?.education_level,
          year: data?.toString(),
        },
      );
      Auth.setDataUser({ ...dataUser, year: data });
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      Helpers.openSnackbar({ message: error });
    }

    nProgress.done();
    this.setState({ loadingYear: false });
  };

  async assignHead() {
    try {
      const {
        state: {},
        props: {},
      } = this;

      const head = getDataHead({
        name: "headMainLayoutHeader",
      });

      const head2 = getDataHead({
        name: "headDashboardPage",
      });

      const pathname = window.location.pathname;
      const arrUrls = Auth.whiteListPath;
      const isWhiteList = arrUrls.includes(pathname);

      if (!isWhiteList) {
        // Data is now provided via Redux props from MainLayout
        this.setState({
          isPaid: this.props.dataUser?.paying,
        });
      }

      this.setState({
        head,
        head2,
      });
    } catch (err) {}
  }

  componentDidMount() {
    this.assignHead();
  }
  componentDidUpdate(prevProps, prevState) {
    if (!Helpers.compareObject(prevProps.dataUser, this.props.dataUser)) {
      this.setState({
        dataUser: this.props.dataUser,
      });
    }
  }

  render() {
    const {
      state: {
        mainClassName,
        showUserDetail,
        head,
        head2,
        showNavigation,
        loadingYear,
      },
      props: { dataSummary, dataUser: propsDataUser, isPaid: propsIsPaid },
    } = this;

    const dataUser = propsDataUser || Auth.getDataUser();
    const isPaid = propsIsPaid !== undefined ? propsIsPaid : this.state.isPaid;

    const yearList = [
      { value: 1, label: "oneYear" },
      { value: 2, label: "twoYear" },
      { value: 3, label: "threeYear" },
      { value: 4, label: "fourYear" },
      { value: 5, label: "fiveYear" },
      { value: 6, label: "sixYear" },
    ];

    return (
      <>
        {head && (
          <div className={mainClassName}>
            <Announcement />
            <Navbar
              mainClassName={mainClassName}
              userType="student"
              dataUser={dataUser}
              head={head}
              head2={head2}
              showUserDetail={showUserDetail}
              onUserCardClick={this.handleEvent.bind(this)}
              onUserCardClose={(settingId) =>
                this.handleEvent({
                  type: "click-user-card-close",
                  id: settingId,
                })
              }
              onMenuClick={this.handleEvent.bind(this, {
                type: "click-nav-action",
              })}
              loadingYear={loadingYear}
              dataSummary={dataSummary}
              onChangeYear={this.onChangeYear}
              showMoreButton={true}
              showSubscriptionStatus={true}
              truncateName={true}
              isPaid={isPaid}
            />
          </div>
        )}
      </>
    );
  }
}
const mapStateToProps = (state) => ({
  dataSummary: state.mainLayoutReducers?.dataSummary,
  dataUser: state.mainLayoutReducers?.dataUser,
});

export default connect(mapStateToProps, { assignMainLayout })(
  withAppRouter(index),
);

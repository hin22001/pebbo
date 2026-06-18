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
import { ClassAPI } from "@/src/app/data/api";
import { Announcement } from "../../../elements";

class index extends Component {
  constructor(props) {
    super(props);

    this.state = {
      mainClassName: "main-layout-teacher-section-header",
      showUserDetail: false,
      showNavigation: true,
      classroom: [],
      selectedClass: null,
      loadingClassroom: true,
    };
  }

  getClassroom = async () => {
    this.setState({ loadingClassroom: true });
    try {
      //   const data = await ClassAPI.getClassroom({
      // 	page_number: 1,
      // 	rows_per_page: 3,
      //   }, {})
      //   const finalData = data?.payload?.data?.data
      //   this.setState({classroom: finalData})
      const dummyData = [
        { id: 1, classroom_name: "7A" },
        { id: 2, classroom_name: "8B" },
        { id: 3, classroom_name: "9C" },
      ];
      this.setState({ classroom: dummyData });

      let selectedClass = localStorage.getItem("selectedClass");
      if (!selectedClass) {
        selectedClass = dummyData[0]?.id;
        localStorage.setItem("selectedClass", selectedClass);
      }
      this.setState({ selectedClass });
    } catch (error) {}
    this.setState({ loadingClassroom: false });
  };

  onChangeClassroom = (event) => {
    const data = event?.target?.value;
    this.setState({ selectedClass: data });
    localStorage.setItem("selectedClass", data);
  };

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
                  this.props.router.push("/dashboard/teacher-profile");
                }
                break;
            }
          }
          break;

        case "click-nav-action":
          {
            this.props.navAction({
              type: params?.type,
              showNavigation: !this.state.showNavigation,
            });

            this.setState({
              showNavigation: !this.state.showNavigation,
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

  async assignHead() {
    try {
      this.getClassroom();

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
        classroom,
        loadingClassroom,
        selectedClass,
      },
      props: {},
    } = this;

    let dataUser = this.props.dataUser || Auth.getDataUser();

    return (
      <>
        {head && (
          <div className={mainClassName}>
            <Announcement />

            <Navbar
              mainClassName={mainClassName}
              userType="teacher"
              dataUser={dataUser}
              head={head}
              head2={head2}
              showUserDetail={showUserDetail}
              showNavigation={showNavigation}
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
              classroom={classroom}
              selectedClass={selectedClass}
              loadingClassroom={loadingClassroom}
              onChangeClassroom={this.onChangeClassroom}
            />
          </div>
        )}
      </>
    );
  }
}
export default connect(null, { assignMainLayout })(withAppRouter(index));

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
import nProgress from "nprogress";
import { Helpers } from "@/src/app/utils";
import { Config } from "@/src/app/constant";
import { LinkWrapper } from "../../../modules";
import { Announcement } from "../../../elements";

class index extends Component {
  constructor(props) {
    super(props);

    this.state = {
      mainClassName: "main-layout-admin-section-header",
      showUserDetail: false,
      showNavigation: true,
    };
  }

  checkUrl(url) {
    const url_ = window.location.href;
    return url_?.includes(url);
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
      state: { mainClassName, showUserDetail, head, head2, showNavigation },
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
              userType="admin"
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
            />
          </div>
        )}
      </>
    );
  }
}
export default connect(null, { assignMainLayout })(index);

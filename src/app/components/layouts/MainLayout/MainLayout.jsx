"use client";
import React from "react";
import _ from "lodash";
import { withAppRouter } from "@/app/utils/withAppRouter";
import classnames from "classnames";
import { connect } from "react-redux";
import {
  assignMainLayout,
  assignAuthentication,
} from "@/app/contexts/redux/actions";

import Alert from "@/elements/alert/Alert";
import Loader from "@/elements/loader/Loader";
import IconButton from "@/elements/icon/IconButton";
import {
  IntroductionModal,
  introScenes,
} from "@/app/components/elements/onboarding";

import NoticeCard from "@/modules/card/NoticeCard";
import ModalConfirm from "@/modules/modal/ModalConfirm";
import List from "@/modules/list/List";
import ModalDrawer from "@/modules/modal/ModalDrawer";

import { getDataHead } from "@/app/data/head";

import { closeSnackbar, SnackbarContent, SnackbarProvider } from "notistack";

import Helpers from "@/app/utils/Helpers";

import { Auth, Language, TempData } from "@/app/data/local";
import {
  HeaderAdminMainLayout,
  HeaderMainLayout,
  HeaderTeacherMainLayout,
  Navigation,
  TeacherNavigation,
} from "./sections";
import { getLabel } from "@/src/app/data/locale";
import { CategoryHelpers } from "@/app/utils";
import nProgress from "nprogress";

import localFont from "next/font/local";
import LoginAPI from "../../../data/api/LoginAPI";
import Config from "@/app/constant/Config";
import SystemAPI from "../../../data/api/SystemAPI";
import UserAPI from "../../../data/api/UserAPI";
import backgroundMusicManager from "@/app/utils/BackgroundMusicManager";

// Font files can be colocated inside of `pages`
// const fontOpenHunin = localFont({ src: 'public/font/font-open-hunin.ttf' })

class MainLayout extends React.Component {
  // === Notes ===
  // => Handling Alert On Leave

  constructor(props) {
    super(props);

    this.state = {
      mainClassName: "main-layout",
      showLoader: false,
      showHeader: true,
      showNavigation: window.innerWidth < 1000 ? false : true,
      showMainLayout: true,
      isAccessValid: true,
      alert: {
        type: "warning",
        isOpen: false,
        message: "",
      },
      modalCategories: {
        isOpen: 0,
      },
      reconcilePayment: null,
      isMini: window.innerWidth < 1000 ? false : true,
      isWhiteList: true,
      showIntroModal: false,
      dataUser: props.initialUser || null,
    };

    this.header = React.createRef();
    this.handleResize = this.handleResize.bind(this);
  }

  performSurgicalClear(newVersion) {
    if (typeof window === "undefined") return;

    // Keys to PRESERVE (Authentication & Core Identity)
    const preservedKeys = [
      "auth",
      "token",
      "_pebbo",
      "user_id",
      "app_version",
      "language",
      "pebbo_onboarding_completed",
      "hasSeenStreakPopup",
    ];

    // Get all current keys
    const allKeys = Object.keys(localStorage);

    // Filter and remove stale data surgically
    allKeys.forEach((key) => {
      if (!preservedKeys.includes(key)) {
        localStorage.removeItem(key);
      }
    });

    // Clear session storage (usually safe to clear entirely)
    sessionStorage.clear();

    // Set new version and reload
    localStorage.setItem("app_version", newVersion);
    window.location.reload(true);
  }

  closeAlert() {
    this.setState({
      alert: {
        ...this.state.alert,
        isOpen: false,
      },
    });
    TempData.removeData("ASSIGN_OPEN_ALERT");
  }

  openAlert(message, type = "error") {
    this.setState({
      alert: {
        ...this.state.alert,
        isOpen: true,
        message: message,
        type: type,
      },
    });
  }

  async handleAcceptModalConfirmLeave() {
    try {
      const {
        state: { modalConfirmLeave },
      } = this;

      window.removeEventListener("beforeunload", this.onUnload);

      if (this.props.assignMainLayout) {
        await this.props.assignMainLayout({
          type: "ASSIGN_SHOW_ALERT_ON_LEAVE",
          value: false,
        });

        await this.props.assignMainLayout({
          type: "ASSIGN_OPEN_ALERT_ON_LEAVE",
          value: false,
        });
      }

      await this.setState({
        showAlertOnLeave: false,
      });

      if (modalConfirmLeave?.link) {
        this.props.router.replace(modalConfirmLeave.link);
      } else if (modalConfirmLeave?.useBack) {
        this.props.router.back();
      }

      await this.handleCloseModalConfirmLeave();
    } catch (err) {}
  }

  async handleOpenModalConfirmLeave(params) {
    try {
      await this.setState({
        showAlertOnLeave: true,
        modalConfirmLeave: {
          isOpen: true,
          link: params?.link,
          useBack: params?.useBack,
          headType: params?.headType || "leavePage",
        },
      });
    } catch (err) {}
  }

  async handleCloseModalConfirmLeave() {
    try {
      await this.setState({
        modalConfirmLeave: {
          isOpen: false,
          head: null,
          type: null,
        },
      });
    } catch (err) {}
  }

  async openLoginScreen() {
    try {
      this.handleCloseModalFeatureLocked();

      if (this.props.assignAuthentication) {
        this.props.assignAuthentication({
          type: "ASSIGN_SHOW_LOGIN",
          value: Helpers.randomNumber(100),
        });
      }
    } catch (err) {}
  }

  async handleOpenModalFeatureLocked(params) {
    try {
      await this.setState({
        modalFeatureLocked: {
          isOpen: true,
          headType: "featureLocked",
          ...(params || {}),
        },
      });
    } catch (err) {}
  }

  async handleCloseModalFeatureLocked() {
    try {
      const {
        state: { modalFeatureLocked },
        props: {},
      } = this;

      if (modalFeatureLocked?.strictOnClose) {
        //=> go back on close

        await this.openLoader();

        if (modalFeatureLocked?.strictOnClose?.href) {
          await this.props.router.replace(
            modalFeatureLocked?.strictOnClose?.href,
          );
        } else {
          await this.props.router.back();
        }

        await this.closeLoader();
      }

      await this.setState({
        modalFeatureLocked: {
          isOpen: false,
          head: null,
        },
      });

      if (this.props.assignMainLayout) {
        this.props.assignMainLayout({
          type: "ASSIGN_OPEN_FEATURE_LOCKED_ALERT",
          value: false,
        });
      }
    } catch (err) {
      await this.closeLoader();
    }
  }

  async handleEvent(params) {
    try {
      const {
        state: { modalCategories },
        props: {},
      } = this;

      switch (params?.type) {
        case "click-nav-action":
          {
            this.setState({
              showNavigation: !this.state.showNavigation,
            });
          }
          break;

        case "open-intro-modal":
          {
            this.setState({ showIntroModal: true });
          }
          break;

        case "show-category":
          {
            this.setState({
              modalCategories: {
                isOpen: modalCategories?.isOpen + 1,
              },
            });
          }
          break;
      }
    } catch (err) {
      await this.props.assignMainLayout({
        type: "ASSIGN_CLOSE_LOADER",
      });
    }
  }

  async openLoader(timeout = 15000) {
    await this.setState({
      showLoader: true,
    });

    async function handleTimeout(_this) {
      setTimeout(async function () {
        await _this.closeLoader();
      }, timeout);
    }
    handleTimeout(this);
  }

  async closeLoader() {
    await this.setState({
      showLoader: false,
    });
  }

  assignPropsLoader() {
    this.setState({
      showLoader: this.props.showLoader,
    });
  }

  async assignHead() {
    try {
      TempData.init();

      const headNoticeCard = getDataHead({
        name: "headNoticeCard.accessDenied",
      });
      const headModalConfirm = getDataHead({ name: "headModalConfirm" });
      // const showNavigation = this.props.showNavigation || TempData.getData('ASSIGN_SHOW_NAVIGATION')
      const dataUser = this.props.initialUser || (await Auth.refreshCurrentUser());

      if (dataUser) {
        Auth.setDataUser(dataUser);
      }

      // Parallelize remaining metadata fetches
      const fetchData = async () => {
        const pathname = this.props.router?.pathname || "/";
        const isDashboardRoot = pathname === "/dashboard";
        const isStudentProfile = pathname === "/dashboard/student-profile";

        const [reconcileRes, summaryRes] = await Promise.all([
          !this.state.reconcilePayment && dataUser && !this.state.isWhiteList
            ? LoginAPI.postReconcilePaymentStatus()
            : Promise.resolve(this.state.reconcilePayment),
          !this.state.isWhiteList &&
          !isDashboardRoot &&
          !isStudentProfile
            ? UserAPI.getSummary()
            : Promise.resolve(null),
        ]);

        if (reconcileRes) {
          this.setState({ reconcilePayment: reconcileRes });
          this.props.assignMainLayout({
            type: "ASSIGN_UPDATE_RECONCILE_PAYMENT",
            value: reconcileRes,
          });
        }

        if (summaryRes?.payload?.data) {
          this.setState({ dataSummary: summaryRes.payload.data });
          this.props.assignMainLayout({
            type: "ASSIGN_UPDATE_SUMMARY",
            value: summaryRes.payload.data,
          });
        }
      };

      // Background the heavier fetches to unblock rendering
      fetchData();

      this.setState({
        // showNavigation,
        headNoticeCard,
        headModalConfirm,
        dataUser,
      });

      if (this.props.assignMainLayout) {
        this.props.assignMainLayout({
          type: "ASSIGN_UPDATE_USER_INFO",
          value: dataUser,
        });
      }

      // Keep query params when normalizing route after layout mount.
      const currentRoute =
        this.props?.router?.asPath || this.props?.router?.pathname || "/";
      this.props.router.replace(currentRoute);
    } catch (err) {}
  }

  onUnload(e) {
    // the method that will be used for both add and remove event
    e.preventDefault();
    e.returnValue = "";
  }

  assignSessionId() {
    try {
      if (!window.sessionStorage?.sessionId) {
        const sessionId = parseInt(
          (new Date().getTime() + "" + Helpers.randomNumber(100)).toString(),
        );
        window.sessionStorage.sessionId = sessionId;
      }
    } catch (err) {}
  }

  async setBrowserHistory(pathname) {
    try {
      TempData.setData({
        name: "history",
        type: "session",
        data: [...(TempData.getData("history") || []), pathname],
      });
    } catch (err) {}
  }
  async assignHeadCategories() {
    try {
      const dataUser = Auth.getDataUser();

      const dataCategory = CategoryHelpers.getRefactorCategory(dataUser?.year);

      this.setState({
        headCategories: dataCategory,
      });
    } catch (err) {}
  }

  handleResize() {
    this.setState({
      showNavigation: window.innerWidth < 1000 ? false : true,
      isMini: window.innerWidth < 1000 ? false : true,
    });
  }

  async componentDidMount() {
    try {
      const pathname = window.location.pathname;
      const arrUrls = Auth.whiteListPath;
      const isWhiteList = arrUrls.includes(pathname);
      const isDashboardRoot = pathname === "/dashboard";
      const hasInitialUser = Boolean(this.props.initialUser);
      const shouldBlockInitialPaint = !(isDashboardRoot && hasInitialUser);

      // Cache Busting: Database-Driven Versioning
      if (typeof window !== "undefined") {
        SystemAPI.getRequiredVersion()
          .then((res) => {
            const remoteVersion = res?.payload?.data?.required_app_version;
            const currentStored = localStorage.getItem("app_version");

            // If remote version exists and is different from what we've previously applied/stored
            if (remoteVersion && remoteVersion !== currentStored) {
              console.log(
                `🚀 Version mismatch (Stored: ${currentStored}, Remote: ${remoteVersion}). Clearing stale cache...`,
              );
              this.performSurgicalClear(remoteVersion);
            }
          })
          .catch((err) =>
            console.log("System version check background silent fail", err),
          );
      }

      this.setState({ isWhiteList });

      if (hasInitialUser) {
        Auth.setDataUser(this.props.initialUser);
      }

      if (shouldBlockInitialPaint) {
        await this.openLoader();
      }

      await this.assignSessionId();
      await this.assignHeadCategories();
      await this.assignHead();

      await this.setState({
        minimize:
          window.innerWidth > 768 && window.innerWidth < 1100 ? true : false,
        showAlertOnLeave: this.props.showAlertOnLeave,
      });

      if (this.props.showAlertOnLeave) {
        window.addEventListener("beforeunload", this.onUnload);
      } else {
        window.removeEventListener("beforeunload", this.onUnload);
      }

      // Router.events is not supported in App Router. NProgress handles global route changes elsewhere or via an interceptor inside App Router's custom approach.

      await this.assignPropsLoader();
      if (shouldBlockInitialPaint) {
        await this.closeLoader();
      }

      // === Contextual Intro Trigger ===
      if (typeof window !== "undefined" && !isWhiteList) {
        const path = this.props.router.pathname;
        const hasSpecificIntro = introScenes[path];

        if (hasSpecificIntro) {
          const introCompleted = localStorage.getItem(
            `intro_completed_${path}`,
          );
          if (!introCompleted) {
            this.setState({ showIntroModal: true });
          }
        } else {
          // Fallback to default intro if not seen
          const introCompleted = localStorage.getItem("intro_completed");
          if (!introCompleted && path === "/dashboard") {
            // Only auto-show default on dashboard
            this.setState({ showIntroModal: true });
          }
        }
      }

      // === Route-aware Background Music ===
      if (backgroundMusicManager) {
        // Teacher portal has no background music — suppress it entirely
        // (no toggle is shown there either). Recomputed every mount so it
        // resets correctly when a different role logs in on the same browser.
        const isTeacherUser = this.state.dataUser?.role?.name === "Teacher";
        backgroundMusicManager.setSuppressed(isTeacherUser);
        backgroundMusicManager.setCurrentRoute(this.props.router.pathname);
      }

      window.addEventListener("resize", this.handleResize);
      this.handleResize();
    } catch (err) {
      await this.closeLoader();
      nProgress.done();
    }
  }

  async componentDidUpdate(prevProps) {
    try {
      // ======================================================================
      // ======= Show Alert On Leave (Usually used for Page Forms )============
      // ======================================================================

      if (prevProps.router.pathname !== this.props.router.pathname) {
        const path = this.props.router.pathname;
        if (introScenes[path]) {
          const introCompleted = localStorage.getItem(
            `intro_completed_${path}`,
          );
          if (!introCompleted) {
            this.setState({ showIntroModal: true });
          }
        }

        // Update background music for new route
        if (backgroundMusicManager) {
          backgroundMusicManager.setCurrentRoute(path);
        }
      }

      if (prevProps.showAlertOnLeave != this.props.showAlertOnLeave) {
        if (this.props.showAlertOnLeave) {
          window.addEventListener("beforeunload", this.onUnload);
        } else {
          window.removeEventListener("beforeunload", this.onUnload);
        }

        await this.setState({
          showAlertOnLeave: this.props.showAlertOnLeave,
        });

        if (!this.props.showAlertOnLeave) {
          this.handleCloseModalConfirmLeave();
        }
      }

      // =============================================================================
      // ======================= Directly Open Alert Custom ==========================
      // =============================================================================

      if (prevProps.alert != this.props.alert) {
        this.setState({
          alert:
            this.props.alert || TempData.getData("ASSIGN_OPEN_ALERT")?.data,
        });
      }

      // =============================================================================
      // ======================= Directly Open Loader ================================
      // =============================================================================

      if (prevProps.openLoader != this.props.openLoader) {
        this.setState({
          openLoader:
            this.props.openLoader ||
            TempData.getData("ASSIGN_OPEN_LOADER")?.data,
        });
      }

      // =============================================================================
      // ======================= Directly Open AlertOnLeave ==========================
      // =============================================================================

      if (prevProps.openAlertOnLeave != this.props.openAlertOnLeave) {
        if (this.props.openAlertOnLeave) {
          this.handleOpenModalConfirmLeave(this.props.openAlertOnLeave);
        } else {
          this.handleCloseModalConfirmLeave();
        }
      }

      // ======================================================================
      // ==== Open Modal Feature Locked (Direct to Login Screen) ==============
      // ======================================================================

      if (
        prevProps.openFeatureLockedAlert != this.props.openFeatureLockedAlert
      ) {
        if (this.props.openFeatureLockedAlert) {
          this.handleOpenModalFeatureLocked(this.props.openFeatureLockedAlert);
        } else if (this.props.openFeatureLockedAlert == false) {
          this.handleCloseModalFeatureLocked();
        }
      }

      // ======================================================================
      // ========================== Open LOADER ===============================
      // ======================================================================

      if (prevProps.openLoader != this.props.openLoader) {
        if (this.props.openLoader) {
          await this.openLoader(this.props.openLoader);
        } else {
          await this.closeLoader();
        }
      }

      if (prevProps.showMainLayout != this.props.showMainLayout) {
        const showMainLayout =
          this.props.showMainLayout ||
          TempData.getData("ASSIGN_SHOW_MAIN_LAYOUT");

        await this.setState({
          showMainLayout,
        });
      }

      // ======================================================================
      // ============================ On Router Changed (ASPATH) =======================
      // ======================================================================

      if (prevProps.router.asPath != this.props.router.asPath) {
        //=> more specific than using pathname will consider query change

        TempData.init();
      }

      // ======================================================================
      // ======================= On Router Changed ============================
      // ======================================================================

      if (prevProps.router.pathname != this.props.router.pathname) {
        const showMainLayout = TempData.getData("ASSIGN_SHOW_MAIN_LAYOUT");

        await this.setState({
          showMainLayout,
        });

        this.setBrowserHistory(prevProps.router.pathname);
      }

      if (prevProps.router.locale != this.props.router.locale) {
        Language.setLanguage(this.props.router.locale);
      }
    } catch (err) {
      await this.closeLoader();
      nProgress.done();
    }
  }

  componentWillUnmount() {
    if (this.state.showAlertOnLeave) {
      window.removeEventListener("beforeunload", this.onUnload);
    }
    window.removeEventListener("resize", this.handleResize);
  }

  componentDidCatch(error, info) {
    this.closeLoader();
    nProgress.done();
  }

  render() {
    const {
      state: {
        mainClassName,
        showAlertOnLeave,
        isAccessValid,
        modalConfirmLeave,
        modalFeatureLocked,
        headNoticeCard,
        alert,
        showNavigation,
        showMainLayout,
        showLoader,
        headCategories,
        modalCategories,
        dataUser,
        reconcilePayment,
        isMini,
        isWhiteList,
      },
      props: { children, useContentOnly },
    } = this;

    const roleName = String(dataUser?.role?.name || "").toLowerCase();
    const roleId = String(dataUser?.role?.id || "").toLowerCase();
    const isSystemAdmin = roleId === "system_admin" || roleName === "system admin";
    const isTeacher = dataUser?.role?.name === "Teacher";
    const isAdmin = dataUser?.role?.name === "Admin";
    const isStudent = dataUser?.role?.name === "Student" || isSystemAdmin;

    const className = classnames(
      mainClassName,
      useContentOnly ? "content-only" : "",
      isAdmin ? "" : showNavigation ? "show-navigation" : "",
      isTeacher ? "teacher-layout" : "",
    );

    const ModalConfirmLeave = ModalConfirm;
    const ModalFeatureLocked = ModalConfirm;

    const snackbarConfig = {
      action: (snackbarId) => (
        <>
          <IconButton
            icon="Close"
            color="white"
            handleClick={() => closeSnackbar(snackbarId)}
          />
        </>
      ),
      Components: {
        sessionTimeout: (notistackalert) => {
          return (
            <SnackbarContent>
              <span>Hello</span>
            </SnackbarContent>
          );
        },
      },
    };

    return (
      <SnackbarProvider {...(snackbarConfig || {})}>
        <div className={className + " "}>
          <div className={mainClassName + "-content"}>
            <Loader isOpen={showLoader} resetModal={true} />

            {alert?.isOpen && (
              <Alert
                {...(alert || {})}
                handleClose={this.closeAlert.bind(this)}
                theme="float"
              />
            )}

            {isTeacher ? (
              <HeaderTeacherMainLayout
                navAction={this.handleEvent.bind(this)}
                dataUser={this.props.dataUser}
              />
            ) : isAdmin ? (
              <HeaderAdminMainLayout
                navAction={this.handleEvent.bind(this)}
                dataUser={this.props.dataUser}
              />
            ) : isStudent ? (
              <HeaderMainLayout
                navAction={this.handleEvent.bind(this)}
                dataUser={this.props.dataUser}
              />
            ) : (
              <></>
            )}

            <div className={mainClassName + "-content-main"}>
              {isAccessValid ? (
                children
              ) : (
                <div className={mainClassName + "-content-notice-card"}>
                  <NoticeCard
                    {...headNoticeCard}
                    useButton={[
                      {
                        ...(headNoticeCard && headNoticeCard.useButton[0]),
                        href: "/" + (this.props.router.locale || "en"),
                      },
                    ]}
                  />
                </div>
              )}
            </div>

            {!useContentOnly && (
              <div
                className="backdrop"
                onClick={() => this.header.current.showMenu()}
              ></div>
            )}

            {!isWhiteList && (
              <>
                {isTeacher ? (
                  <div
                    className={
                      mainClassName +
                      `-block-navigation-student${isMini ? "-mini" : ""}`
                    }
                  >
                    <TeacherNavigation
                      showAlertOnLeave={showAlertOnLeave}
                      handleOpenModalConfirmLeave={this.handleOpenModalConfirmLeave.bind(
                        this,
                      )}
                      isMinimized={(e) => {
                        this.setState({ minimize: e });
                      }}
                      navAction={this.handleEvent.bind(this)}
                      isMini={isMini}
                      setMini={(e) => {
                        this.setState({ isMini: e });
                      }}
                      dataUser={dataUser}
                    />
                  </div>
                ) : isStudent ? (
                  <div
                    className={
                      mainClassName +
                      `-block-navigation-student${isMini ? "-mini" : ""}`
                    }
                  >
                    <Navigation
                      showAlertOnLeave={showAlertOnLeave}
                      handleOpenModalConfirmLeave={this.handleOpenModalConfirmLeave.bind(
                        this,
                      )}
                      isMinimized={(e) => {
                        this.setState({ minimize: e });
                      }}
                      reconcilePayment={reconcilePayment}
                      navAction={this.handleEvent.bind(this)}
                      isMini={isMini}
                      setMini={(e) => {
                        this.setState({ isMini: e });
                      }}
                    />
                  </div>
                ) : (
                  <></>
                )}
              </>
            )}

            <ModalDrawer
              isOpen={modalCategories?.isOpen}
              title={getLabel({ name: "category" })}
            >
              <List data={headCategories} />
            </ModalDrawer>

            {/* Mascot Introduction Modal */}
            <IntroductionModal
              pageContext={this.props.router.pathname}
              isOpen={this.state.showIntroModal}
              onClose={() => this.setState({ showIntroModal: false })}
              onComplete={() => this.setState({ showIntroModal: false })}
            />
          </div>
        </div>
      </SnackbarProvider>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    ...(state.mainLayout || {}),
  };
};

export default connect(mapStateToProps, {
  assignMainLayout,
  assignAuthentication,
})(withAppRouter(MainLayout));

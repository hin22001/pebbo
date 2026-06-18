"use client";
import React, { Component } from "react";
import { withAppRouter } from "@/app/utils/withAppRouter";
import _ from "lodash";

import Link from "next/link";
import Image from "next/image";

import {
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Stack,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";

import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { HelpOutline } from "@mui/icons-material";

import { getDataHead } from "@/app/data/head";

import IconCustom from "@/elements/icon/IconCustom";
import IconButton from "@/elements/icon/IconButton";
import Button from "@/elements/button/Button";
import Tooltip from "@/elements/tooltip/Tooltip";

import { locale } from "@/locale";
import { Helpers } from "@/app/utils";
import LinkWrapper from "@/modules/link/LinkWrapper";
import ImageHandler from "@/elements/image/ImageHandler";
import { Config } from "@/src/app/constant";
import { ArrowBackIos, ArrowForwardIos } from "@mui/icons-material";

class Navigation extends Component {
  constructor(props) {
    super(props);

    this.state = {
      mainClassName: "main-layout-section-navigation",
      activePage: "/",
      minimize: null,
      head: [],
      showNavigation: false,
      menuChild: "",
      anchorChild: false,
      isMini: window.innerWidth < 1000 ? false : true,
      innerWidth: window.innerWidth,
    };

    this.handleResize = this.handleResize.bind(this);
  }

  minimize() {
    this.setState({
      minimize: !this.state.minimize,
    });

    this.setBodyClassname(!this.state.minimize);

    this.props.isMinimized(!this.state.minimize);
  }

  setBodyClassname(status) {
    if (status) {
      document.querySelector("body").classList.add("minimized");
    } else {
      document.querySelector("body").classList.remove("minimized");
    }
  }

  handleClickMenu() {
    if (this.state.minimize) {
      this.minimize();
    }
  }

  async assignHead() {
    try {
      const activePage = this.props.router?.pathname;

      let head = await getDataHead({ name: "headMainLayoutNavigation" });
      let head2 = await getDataHead({ name: "headDashboardPage" });
      head = head.map((item) => {
        return {
          ...(item || {}),
          open: true,
        };
      });

      await this.setState({
        head,
        head2,
        activePage,
      });
    } catch (err) {}
  }

  getPathName() {}

  async setActivePageFromPath(params) {
    try {
      const activePage = params?.activePage || this.props.router.pathname;

      const head = params?.head || this.state.head;

      let foundIndex;

      head?.forEach((menu, indexMenu) => {
        const found = menu?.child?.find(
          (subMenu) => subMenu.href == activePage,
        );

        if (found) {
          foundIndex = indexMenu;
        }
      });

      if (foundIndex >= 0) {
        await this.handleEvent({
          type: "click-parent-menu",
          index: foundIndex,
        });
      }

      return activePage;
    } catch (err) {}
  }

  getCustomerPortalUrl() {
    const isProd = process.env.NEXT_PUBLIC_IS_PROD === "true";
    const testUrl = process.env.NEXT_PUBLIC_TEST_CUSTOMER_PORTAL_URL;
    const prodUrl = process.env.NEXT_PUBLIC_PROD_CUSTOMER_PORTAL_URL;

    return isProd ? prodUrl : testUrl;
  }

  async componentDidMount() {
    await this.assignHead();
    await this.setState({
      minimize: true,
    });
    await this.setBodyClassname(this.state.minimize);

    window.addEventListener("resize", this.handleResize);
    this.handleResize();
  }

  async handleEvent(params) {
    try {
      switch (params?.type) {
        case "click-parent-icon":
          {
            this.setState({
              menuChild: params?.icon,
              anchorChild: params?.event?.currentTarget,
            });
          }
          break;

        case "click-child-icon":
          {
            this.setState({
              menuChild: "",
              anchorChild: null,
            });

            if (params?.url) {
              this.props.router.push(params?.url);
            }
          }
          break;

        case "click-parent-menu":
          {
            let head = this.state.head;

            const isOpen = head[params?.index]["open"];
            head[params?.index]["open"] = !isOpen;

            this.setState({
              head,
            });
          }
          break;

        case "click-nav-action":
          {
            const hideMini = this.state.innerWidth < 1000;

            if (hideMini) {
              this.props.navAction({
                type: params?.type,
                showNavigation: false,
              });
            } else {
              this.props.setMini(!this.state.isMini);

              this.setState({
                isMini: !this.state.isMini,
              });
            }
          }
          break;
      }
    } catch (err) {
      await this.props.assignMainLayout({
        type: "ASSIGN_CLOSE_LOADER",
      });
    }
  }

  handleResize() {
    this.setState({
      innerWidth: window.innerWidth,
      isMini: window.innerWidth < 1000 ? false : true,
    });
  }

  async componentDidUpdate(prevProps, prevState) {
    if (
      prevProps.router.pathname != this.props.router.pathname &&
      this.props.router.pathname
    ) {
      const activePage = this.props.router.pathname;

      await this.setState({
        activePage,
      });
    }

    if (prevState?.activePage != this.state.activePage) {
      // await this.setActivePageFromPath({ activePage: this.state.activePage })
    }
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.handleResize);
  }

  componentDidCatch(error, errorInfo) {}

  render() {
    const {
      state: {
        activePage,
        head,
        head2,
        mainClassName,
        showNavigation,
        menuChild,
        anchorChild,
        isMini,
      },
      props: { reconcilePayment },
    } = this;

    let head_ = head;

    if (!reconcilePayment?.payload?.data?.paying) {
      head_ = head.slice(0, 1);
    }

    return (
      <nav
        className={
          mainClassName + " " + (this.state.minimize ? "minimized" : "")
        }
      >
        <div className={mainClassName + "-logo-wrapper"}>
          <div className={mainClassName + "-logo-wrapper-inner"}>
            <LinkWrapper
              className={mainClassName + `-logo-link${isMini ? "-mini" : ""}`}
              href="/dashboard"
            >
              <ImageHandler
                src={Config.logo}
                alt="Logo Pebbo"
                className="image-contain"
              />
            </LinkWrapper>
            {/* <LinkWrapper className={mainClassName + '-logo-help'} href='/dashboard'>
							<ImageHandler
								src={require('@/images/icon/help-circle.svg')}
								alt="Help"
								className="image-contain"
							/>
						</LinkWrapper> */}
          </div>
          <div
            onClick={this.handleEvent.bind(this, {
              type: "click-nav-action",
            })}
            className={mainClassName + "-arrow-wrapper"}
          >
            {!isMini ? (
              <ArrowBackIos sx={{ fontSize: "14px" }} />
            ) : (
              <ArrowForwardIos sx={{ fontSize: "14px" }} />
            )}
            {/* <IconButton
							icon={showNavigation ? 'ArrowBackIos' : 'Menu'}
							handleClick={this.handleEvent.bind(this, {
								type: 'click-nav-action'
							})}
						/> */}
          </div>
        </div>

        {!isMini ? (
          <List className={mainClassName + "-list"} value={activePage}>
            {head_?.length > 0 &&
              head_.map((menu, indexMenu) => {
                if (menu?.child?.length > 0) {
                  // const activeSubMenu = menu.child.flatMap(i => i.href).find(i => i == activePage)

                  return (
                    <div
                      key={"menu-" + indexMenu}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        flexDirection: "column",
                      }}
                    >
                      {/* === PARENT === */}

                      <ListItemButton
                        className={
                          mainClassName +
                          "-list-menu " +
                          (menu?.className || "") +
                          (menu?.listHref?.includes(activePage) ? "active" : "")
                        }
                        onClick={this.handleEvent.bind(this, {
                          type: "click-parent-menu",
                          data: menu,
                          index: indexMenu,
                        })}
                      >
                        {menu?.icon && (
                          <ListItemIcon>
                            <IconCustom icon={menu.icon} size={"medium"} />
                          </ListItemIcon>
                        )}
                        <ListItemText
                          primary={locale(menu?.label) || ""}
                          className={" " + Helpers.fontZH()}
                        />
                        <Stack className={mainClassName + "-list-menu-expand"}>
                          {!menu?.open ? <ExpandLess /> : <ExpandMore />}
                        </Stack>
                      </ListItemButton>

                      {/* === CHILD === */}

                      <Collapse in={!menu?.open} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding>
                          {menu?.child?.map((subMenu, indexSubMenu) => {
                            return (
                              <LinkWrapper
                                key={
                                  "sub-menu-" + indexMenu + "-" + indexSubMenu
                                }
                                href={subMenu.href}
                              >
                                <ListItemButton
                                  className={
                                    mainClassName +
                                    "-list-sub-menu " +
                                    (activePage == subMenu.href ? "active" : "")
                                  }
                                >
                                  <div
                                    className={
                                      mainClassName +
                                      "-list-sub-menu-bullet-" +
                                      (activePage == subMenu.href
                                        ? "active"
                                        : "inactive")
                                    }
                                  />
                                  {subMenu.icon && (
                                    <ListItemIcon>
                                      <IconCustom
                                        icon={subMenu.icon}
                                        size={"medium"}
                                      />
                                    </ListItemIcon>
                                  )}
                                  <ListItemText
                                    primary={locale(subMenu?.label) || ""}
                                    className={" " + Helpers.fontZH()}
                                  />
                                </ListItemButton>
                              </LinkWrapper>
                            );
                          })}
                        </List>
                      </Collapse>
                    </div>
                  );
                } else {
                  return (
                    <div
                      key={"menu-" + indexMenu}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        flexDirection: "column",
                      }}
                    >
                      <LinkWrapper
                        key={"nav-" + indexMenu + "-" + menu.id}
                        href={menu.href}
                        className={
                          mainClassName +
                          "-content-menu-wrapper " +
                          (activePage == menu.href ? "active" : "")
                        }
                      >
                        <ListItemButton
                          value={menu.href}
                          className={mainClassName + "-content-menu "}
                        >
                          {menu.icon && (
                            <div style={{ marginLeft: "-0.5rem" }}>
                              <ListItemIcon>
                                <IconCustom icon={menu.icon} size={"medium"} />
                              </ListItemIcon>
                            </div>
                          )}

                          <ListItemText
                            primary={locale(menu?.label) || ""}
                            className={" " + Helpers.fontZH()}
                          />
                        </ListItemButton>
                      </LinkWrapper>
                    </div>
                  );
                }
              })}
          </List>
        ) : (
          <Stack className={mainClassName + "-menu-mini"}>
            <Stack alignItems="center">
              {head_?.length > 0 &&
                head_.map((menu, indexMenu) => {
                  if (menu?.child?.length > 0) {
                    return (
                      <Stack
                        key={indexMenu}
                        className={
                          mainClassName +
                          "-menu-mini-row" +
                          (menu?.listHref?.includes(activePage)
                            ? "-active"
                            : "")
                        }
                      >
                        {menu?.icon && (
                          <Tooltip
                            title={locale(menu?.label)}
                            placement="right"
                          >
                            <Stack
                              onClick={(event) =>
                                this.handleEvent({
                                  type: "click-parent-icon",
                                  event,
                                  icon: menu?.icon,
                                })
                              }
                            >
                              <IconCustom icon={menu.icon} size={"medium"} />
                            </Stack>
                          </Tooltip>
                        )}

                        <Menu
                          sx={{ ml: "45px", mt: "-30px" }}
                          id="menu-user-card"
                          anchorEl={anchorChild}
                          // anchorOrigin={{
                          // 	vertical: 'top',
                          // 	horizontal: 'right',
                          // }}
                          keepMounted
                          // transformOrigin={{
                          // 	vertical: 'top',
                          // 	horizontal: 'right',
                          // }}
                          open={menuChild === menu?.icon}
                          onClose={this.handleEvent.bind(this, {
                            type: "click-child-icon",
                          })}
                        >
                          {menu?.child?.length > 0 &&
                            menu?.child?.map((subMenu, indexSubMenu) => (
                              <MenuItem
                                key={"menu-setting-" + indexSubMenu}
                                component={Link}
                                href={Helpers.hrefLocale(subMenu?.href || "")}
                                onClick={this.handleEvent.bind(this, {
                                  type: "click-child-icon",
                                })}
                              >
                                <div
                                  className={
                                    mainClassName +
                                    "-list-sub-menu-bullet-" +
                                    (activePage == subMenu.href
                                      ? "active"
                                      : "inactive")
                                  }
                                />
                                <ListItemText
                                  primary={locale(subMenu?.label) || ""}
                                  className={" " + Helpers.fontZH()}
                                />
                              </MenuItem>
                            ))}
                        </Menu>
                      </Stack>
                    );
                  } else {
                    return (
                      <Tooltip title={locale(menu?.label)} placement="right">
                        <LinkWrapper href={menu?.href}>
                          <Stack
                            key={indexMenu}
                            className={
                              mainClassName +
                              "-menu-mini-row" +
                              (activePage == menu.href ? "-active" : "")
                            }
                          >
                            {menu?.icon && (
                              <IconCustom icon={menu.icon} size={"medium"} />
                            )}
                          </Stack>
                        </LinkWrapper>
                      </Tooltip>
                    );
                  }
                })}
            </Stack>
          </Stack>
        )}

        {/* <div className={mainClassName + "-subs-btn-wrapper"}>
					<Button
                      handleClick={() => window.open(this.getCustomerPortalUrl(), "_blank")}
                      label={locale(head2?.subscription)}
                    />
				</div> */}

        {/* Help Button at Bottom */}
        <Stack
          className={mainClassName + "-help-btn-wrapper"}
          sx={{
            mt: "auto",
            mb: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Tooltip title="Help/Tutorial" placement="right">
            <Stack
              onClick={() =>
                this.props.navAction?.({ type: "open-intro-modal" })
              }
              className={mainClassName + "-help-btn"}
              sx={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                bgcolor: "#f0f0f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.2s ease",
                "&:hover": {
                  bgcolor: "#6B4DE6",
                  color: "#fff",
                  transform: "scale(1.1)",
                },
              }}
            >
              <HelpOutline sx={{ fontSize: 24 }} />
            </Stack>
          </Tooltip>
          {!isMini && (
            <Typography
              variant="caption"
              sx={{ mt: 0.5, color: "#888", fontWeight: 600 }}
            >
              Help
            </Typography>
          )}
        </Stack>
      </nav>
    );
  }
}
export default withAppRouter(Navigation);

"use client";
import React, { Component } from "react";
import classnames from "classnames";

import { getDataHead } from "@/app/data/head";
import {
  Button,
  CircularProgress,
  Chip as MuiChip,
  Stack,
} from "@mui/material";
import { IconCustom } from "../icon";
import { locale } from "@/app/data/locale";
import { Chip } from "../chip";
import Link from "next/link";
import { withAppRouter } from "@/app/utils/withAppRouter";
import _ from "lodash";
import { Helpers } from "@/app/utils";

class index extends Component {
  constructor(props) {
    super(props);

    this.state = {
      mainClassName: "element-button",
    };
  }

  handleClick(e, href) {
    if (
      this.props.handleClick &&
      typeof this.props.handleClick != "undefined"
    ) {
      this.props.handleClick(e);
    } else if (href) {
      this.props.router.push(href);
    }
  }

  async assignHead() {
    try {
      const {
        props: { headType },
      } = this;

      if (headType) {
        const head = getDataHead({ name: "headButton" })[headType];

        this.setState({
          head,
        });
      }
    } catch (err) {}
  }

  async componentDidMount() {
    await this.assignHead();
  }

  async componentDidUpdate(prevProps) {
    if (prevProps.headType != this.props.headType) {
      await this.assignHead();
    }
  }

  render() {
    let {
      state: { head, mainClassName },
      props: {
        href,
        to,
        target,
        value,
        theme,
        disabled,
        label,
        size,
        headType,
        startIcon,
        endIcon,
        id,
        children,
        buttonNumber,
        loading,
        variant,
        sx,
      },
    } = this;

    const isLoadingButton = _.has(this.props, "loading") && loading;

    if (headType && head) {
      label = label ? locale(label) : locale(head.label);
      size = head.size;
      startIcon = head.startIcon;
      endIcon = head.endIcon;
      disabled = disabled || head.disabled;
      target = head.target;
      to = head.to;
      href = this.props.href || head.href;

      theme = head.theme + " " + (this.props.theme || "");
    }

    const className = classnames(
      mainClassName,
      theme || "",
      size ? "size-" + size : "",
      this.props.className || "",
      disabled ? "disabled" : "",
    );

    return (
      <Button
        sx={sx}
        variant={variant || ""}
        value={value ? value : ""}
        className={className}
        disabled={disabled}
        onClick={
          href
            ? () => this.handleClick(null, href)
            : this.handleClick.bind(this)
        }
        startIcon={
          (startIcon || buttonNumber) && (
            <>
              {startIcon && (
                <IconCustom
                  {...(typeof startIcon == "string"
                    ? { icon: startIcon }
                    : startIcon)}
                />
              )}
              {buttonNumber && (
                <Chip
                  {...(Helpers.filterObjectByKey(buttonNumber, ["count"]) ||
                    {})}
                  label={buttonNumber?.count}
                  className={mainClassName + "-number white small"}
                />
              )}
            </>
          )
        }
        endIcon={
          <>
            {(endIcon || isLoadingButton) && (
              <Stack direction={"row"} spacing={1} alignItems={"center"}>
                {endIcon && (
                  <IconCustom
                    {...(typeof endIcon == "string"
                      ? { icon: endIcon }
                      : endIcon)}
                  />
                )}
                {loading && (
                  <CircularProgress className="mui-circular-progress" />
                )}
              </Stack>
            )}
          </>
        }
      >
        {locale(label) || children || ""}
      </Button>
    );
  }
}
export default withAppRouter(index);

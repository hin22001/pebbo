"use client";
import { IconButton, ImageHandler } from "@/app/components/elements";
import Image from "next/image";
import { withAppRouter } from "@/app/utils/withAppRouter";
import React, { Component } from "react";
import classnames from "classnames";
import { LinkWrapper } from "../link";

class Header extends Component {
  constructor(props) {
    super(props);

    this.state = {
      mainClassName: "modules-header",
    };
  }

  componentDidMount() {
    try {
    } catch (err) {}
  }

  render() {
    const {
      state: { mainClassName },
      props: {
        image,
        imageHref,
        title,
        subtitle,
        theme,
        hrefBack,
        topSubtitle,
        disableBack,
        handleBack,
        useRouterBack,
        className,
        useCloseButton,
        useEndButton,
        handleClose,
        useBackground,
        defaultMode, // => font dark or light depend on the background brightness (manual config)
      },
    } = this;

    const refactorClassName = classnames(
      mainClassName,
      className,
      defaultMode || (useBackground ? "dark-mode" : "light-mode"),
      theme,
      useEndButton ? "use-end-button" : "",
    );

    return (
      <div className={refactorClassName}>
        <div
          className={
            mainClassName +
            "-content " +
            (disableBack ? "disable-back" : "") +
            " " +
            (useCloseButton ? "use-close-button" : "")
          }
        >
          {!useCloseButton && !disableBack && (
            <div className={mainClassName + "-button-back"}>
              <IconButton
                icon={"ArrowBackIosNew"}
                // href={hrefBack}
                handleClick={() => {
                  if (hrefBack) {
                    this.props.router.replace(hrefBack);
                  } else if (useRouterBack) {
                    this.props.router.back();
                  } else if (handleBack) {
                    handleBack();
                  }
                }}
              />
            </div>
          )}

          {useCloseButton && (
            <div className={mainClassName + "-button-back"}>
              <IconButton
                handleClick={handleClose}
                {...(useCloseButton?.constructor?.name == "Object"
                  ? { ...(useCloseButton || {}) }
                  : {
                      icon: {
                        name: "Close",
                        type: "mui",
                      },
                    })}
              />
            </div>
          )}

          <div className={mainClassName + "-title"}>
            {image &&
              (imageHref ? (
                <LinkWrapper
                  className={
                    mainClassName +
                    "-image-wrapper " +
                    (imageHref ? "image-link-on" : "")
                  }
                  href={imageHref}
                >
                  <ImageHandler
                    className={mainClassName + "-image "}
                    src={image}
                  />
                </LinkWrapper>
              ) : (
                <ImageHandler
                  className={mainClassName + "-image "}
                  src={image}
                />
              ))}
            {topSubtitle && (
              <h3
                className="text-top-subtitle"
                style={{
                  fontFamily: "'Advercase', serif !important",
                  letterSpacing: "0.07rem",
                }}
              >
                {topSubtitle}
              </h3>
            )}
            {title && (
              <h1
                className="text-title"
                style={{
                  fontFamily: "'Advercase', serif !important",
                  letterSpacing: "0.07rem",
                }}
              >
                {title}
              </h1>
            )}
            {subtitle && (
              <p
                className="text-subtitle"
                style={{
                  fontFamily: "'Advercase', serif !important",
                  letterSpacing: "0.07rem",
                }}
              >
                {subtitle}
              </p>
            )}
          </div>

          <div className={mainClassName + "-end-button"}>
            {useEndButton &&
              (useEndButton?.constructor?.name == "Array" ? (
                useEndButton?.length > 0 &&
                useEndButton.map((item, index) => (
                  <IconButton
                    key={"end-button-icon-" + index}
                    {...(item || {})}
                  />
                ))
              ) : (
                <IconButton {...(useEndButton || {})} />
              ))}
          </div>
        </div>

        {useBackground && (
          <div
            className={
              mainClassName +
              "-background" +
              " " +
              (useBackground?.useOffset ? "offset" : "") +
              " " +
              (useBackground?.color || "")
            }
          >
            {useBackground?.image && (
              <Image
                className={mainClassName + "-background-image "}
                src={useBackground?.image?.src || useBackground?.image}
                width={100}
                height={100}
              />
            )}
          </div>
        )}
      </div>
    );
  }
}

export default withAppRouter(Header);

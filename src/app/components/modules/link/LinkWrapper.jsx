"use client";
import { Helpers } from "@/src/app/utils";
import { Stack } from "@mui/material";
import classnames from "classnames";
import Link from "next/link";

export default function LinkWrapper(props) {
  const {
    data,
    theme,
    className,
    href,
    target,
    handleClick,
    children,
    component,
    externalHref,
  } = props;

  const _href =
    externalHref ||
    (!handleClick && href ? Helpers.hrefLocale(href || data?.href || "") : ""); // => not use href props

  const _handleClick = handleClick || data?.handleClick;
  const _target = target || data?.target || "";

  const isLinkOn = _href || _handleClick;

  const _className = classnames(
    "modules-link-wrapper",
    className,
    data?.theme,
    theme,
    isLinkOn ? "link-on" : "",
  );

  return (
    <>
      {children && (
        <Stack className={_className} component={component}>
          {isLinkOn ? (
            <Link
              href={_href}
              target={_target}
              onClick={(e) => {
                if (!_href && _handleClick) {
                  e?.preventDefault();

                  const value =
                    props?.data?.id ||
                    props?.data?.value ||
                    props?.id ||
                    props?.value ||
                    null;

                  _handleClick(value);
                }
              }}
            >
              {children}
            </Link>
          ) : (
            children
          )}
        </Stack>
      )}
    </>
  );
}

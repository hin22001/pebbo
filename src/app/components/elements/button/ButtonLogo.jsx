"use client";
import classnames from "classnames";
import PropTypes from "prop-types";

import LogoGoogle from "@/images/logo/logo-google.png";
import LogoFacebook from "@/images/logo/logo-facebook.svg";
import LogoApple from "@/images/logo/logo-apple.svg";

import { IconCustom } from "@/elements";
import { getDataHead } from "@/app/data/head";
import Image from "next/image";

const Button = (props) => {
  const {
    className,
    to,
    onClick,
    target,
    href,
    type,
    theme,
    label,
    icon,
    iconColor,
  } = props;

  const headLabel = getDataHead({ name: "headLabel" });

  const headLogo = {
    google: {
      image: LogoGoogle,
      label: "Google",
      imageAlt: "button-logo-image-google",
      theme: theme || "white",
    },
    facebook: {
      image: LogoFacebook,
      label: "Facebook",
      imageAlt: "button-logo-image-facebook",
      theme: theme || "white",
    },
    apple: {
      image: LogoApple,
      label: "Apple",
      imageAlt: "button-logo-image-apple",
      theme: theme || "white",
    },
    contact: {
      icon: "phone-alt",
      label: label || (headLabel && headLabel.contactUs),
      imageAlt: "button-logo-image-contact",
      theme: theme || "is-white-hollow-2",
    },
  };

  const currentHead = type
    ? headLogo[type]
    : {
        theme,
        label,
        icon,
        color: iconColor,
      };

  const classProps = classnames(
    "elements-button",
    "logo",
    className,
    currentHead && currentHead.theme,
  );

  const handleClick = (e) => {
    onClick(e);
  };

  return (
    <a
      className={classProps}
      to={to}
      onClick={handleClick}
      target={target}
      href={href}
    >
      {currentHead.image && (
        <Image src={currentHead.image} alt={currentHead.imageAlt} />
      )}
      {currentHead.icon && (
        <IconCustom icon={currentHead.icon} color={currentHead.color} />
      )}
      {currentHead.label && <p>{currentHead.label}</p>}
    </a>
  );
};

Button.propTypes = {
  to: PropTypes.string,
  className: PropTypes.string,
  onClick: PropTypes.func,
};

Button.defaultProps = {
  onClick: () => {},
  to: "#",
  className: "",
};
export default Button;

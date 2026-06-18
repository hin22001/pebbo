"use client";
import Image from "next/image";
import React from "react";
import classnames from "classnames";
import RectangleImagePlaceholder from "@/images/placeholder/placeholder-image.png";
import SquareImagePlaceholder from "@/images/placeholder/placeholder-icon.png";
import { Skeleton } from "../loader";
import { Helpers } from "@/app/utils";
import { Config } from "@/src/app/constant";

export default function CustomImageHandler(props) {
  const {
    src,
    width,
    height,
    className,
    alt,
    type,
    disableLoader,
    size,
    heightFitContent,
    quality,
    overridePercent,
    borderRadius,
  } = props;

  const isSizeDefined = width || height;

  const isIcon = type == "icon";

  const defaultSize = 500;
  const sizeImage = size; //=> if image is from url, this will be used as the width/height compression size

  const [imageSrc, setImageSrc] = React.useState(src);
  const [imagePlaceholderSrc, setImagePlaceholderSrc] = React.useState(
    SquareImagePlaceholder,
  );
  const [showLoader, setShowLoader] = React.useState(true);
  const [isError, setIsError] = React.useState(false);
  const [refreshElement, setRefreshElement] = React.useState(0);

  const imageRef = React.useRef();
  const imagePlaceholderRef = React.useRef();

  const mainClassName = "elements-image-handler";
  const refactorClassName = classnames(
    mainClassName,
    className,
    type ? "type-" + type : "",
    heightFitContent ? "height-fit-content" : "",
    isError ? "is-error" : "",
  );

  const setToImagePlaceholder = () => {
    try {
      let selectedImagePlaceholder = isIcon
        ? SquareImagePlaceholder
        : RectangleImagePlaceholder;

      if (src?.width && src?.height) {
        if (src?.width == src?.height) {
          selectedImagePlaceholder = SquareImagePlaceholder;
        } else {
          selectedImagePlaceholder = RectangleImagePlaceholder;
        }
      }

      setImagePlaceholderSrc(selectedImagePlaceholder);
    } catch (err) {}
  };

  React.useEffect(() => {
    try {
      if ((imageSrc != src && src) || refreshElement < 3) {
        setImageSrc(src);
      }
    } catch (err) {}
  }, [src, refreshElement, imageSrc]);

  React.useEffect(() => {
    try {
      if (imageRef?.current?.complete) {
        setShowLoader(false);
      }
    } catch (err) {}
  }, []);

  return (
    <div className={refactorClassName}>
      <div className={mainClassName + "-content"}>
        {!disableLoader && (
          <Skeleton
            type="image"
            className={
              mainClassName + "-skeleton " + (showLoader ? "" : "hide")
            }
          />
        )}

        {isError ? (
          <Image
            ref={imagePlaceholderRef}
            alt={Config.appName + " " + (alt || "Image")}
            title={Config.appName + " " + (alt || "Image")}
            src={imagePlaceholderSrc}
            width={width || imagePlaceholderSrc?.width || sizeImage}
            height={height || imagePlaceholderSrc?.height || sizeImage}
            className={
              mainClassName +
              "-image-placeholder " +
              (isSizeDefined ? "" : "next-image-size-strict-contain")
            }
            onLoadingComplete={() => {}}
            onError={(e) => {}}
          />
        ) : (
          <Image
            ref={imageRef}
            quality={quality}
            key={"pebbo-report-image-" + refreshElement}
            alt={Config.appName + " " + (alt || "Image")}
            title={Config.appName + " " + (alt || "Image")}
            src={imageSrc}
            width={width || sizeImage || imageSrc?.width || defaultSize}
            height={height || sizeImage || imageSrc?.height || defaultSize}
            className={
              mainClassName +
              "-image " +
              (isSizeDefined ? "" : "next-image-size-strict-contain") +
              " " +
              (overridePercent
                ? "next-image-size-strict-" + overridePercent
                : "")
            }
            onLoadingComplete={() => {
              setShowLoader(false);
            }}
            onError={(e) => {
              setShowLoader(false);
              setToImagePlaceholder();
              setIsError(true);
            }}
            style={{ borderRadius: borderRadius }}
          />
        )}
      </div>
    </div>
  );
}

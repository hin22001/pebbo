import { Stack, Typography } from "@mui/material";
import _ from "lodash";
import React from "react";

import SwiperCore, { Navigation, Pagination, Autoplay } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import { ImageHandler } from "@/elements";
import { locale } from "@/src/app/data/locale";
import classnames from "classnames";

export default function SwiperCustom(props) {
  const mainClassName = "element-swiper-custom";

  const { data, children, className, slidesPerView } = props;

  const refactorClassName = classnames(mainClassName, className);

  return (
    <Stack className={refactorClassName}>
      <Swiper
        className={mainClassName + "-swiper"}
        spaceBetween={10}
        autoplay={{
          delay: 2000,
        }}
        loop={true}
        modules={[Autoplay, Navigation, Pagination]}
        slidesPerView={slidesPerView == "break" ? null : slidesPerView || 3}
        breakpoints={
          slidesPerView == "break" && {
            0: {
              slidesPerView: 3,
            },
            555: {
              slidesPerView: 4,
            },
            720: {
              slidesPerView: 5,
            },
            1400: {
              slidesPerView: 7,
            },
            1700: {
              slidesPerView: 9,
            },
          }
        }
      >
        {children || (
          <>
            {data?.length > 0 &&
              data?.map((item, index) => (
                <SwiperSlide
                  key={
                    mainClassName +
                    "-swiper-slide-" +
                    index +
                    "-" +
                    _.uniqueId()
                  }
                  className={mainClassName + "-swiper-slide"}
                >
                  <Stack className={mainClassName + "-swiper-slide-content"}>
                    {item?.image && (
                      <ImageHandler
                        src={item?.image?.default?.src}
                        alt={item?.alt}
                      />
                    )}
                    {item?.label && (
                      <Typography className={mainClassName + "-text text-h4"}>
                        {locale(item?.label)}
                      </Typography>
                    )}
                  </Stack>
                </SwiperSlide>
              ))}
          </>
        )}
      </Swiper>
    </Stack>
  );
}

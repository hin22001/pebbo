import { getDataHead } from "@/src/app/data/head";
import { locale } from "@/src/app/data/locale";
import { Stack, Typography } from "@mui/material";
import _, { random } from "lodash";
import React from "react";

export default function useLoader(props) {
  const mainClassName = "element-loader-graph";

  const [listMessage, setlistMessage] = React.useState();

  const head = getDataHead({ name: "headLoaderGraph" });

  const initializeCarousel = () => {
    try {
      const listMessage = head?.messages;
      setlistMessage(listMessage);

      // const elements = document.querySelectorAll('.wrap-carousel-item')[0].classList.add('active-item');
      function loop(indexLoop) {
        try {
          function showSlide() {
            const elements = document.querySelectorAll(
              "." + mainClassName + "-message-item",
            );

            for (var i = 0; i < elements.length; i++) {
              if (i == indexLoop) {
                // elements[i].classList.add('animate__fadeInDown');
                elements[i].classList.add("active-item");
                // elements[i].classList.remove('animate__fadeOutUp');
                elements[i].classList.remove("inactive-item");
              } else {
                // elements[i].classList.remove('animate__fadeInDown');
                elements[i].classList.remove("active-item");
                // elements[i].classList.add('animate__fadeOutUp');
                elements[i].classList.add("inactive-item");
              }
            }
            loop(indexLoop == elements?.length - 1 ? 0 : indexLoop + 1);
          }

          if (indexLoop == null) {
            showSlide();
          } else {
            setTimeout(() => {
              showSlide();
            }, 5000);
          }
        } catch (err) {}
      }

      loop(null);
    } catch (err) {}
  };

  React.useEffect(() => {
    initializeCarousel();
  }, []);

  return (
    <Stack className={mainClassName + "-message"}>
      {listMessage?.map((item, index) => {
        let label = locale(item?.label);
        let text = typeof label == "string" ? label : "";

        return (
          <Typography
            key={mainClassName + "-" + _.uniqueId()}
            className={mainClassName + "-message-item animate__animated "}
            sx={{ fontFamily: "'Advercase', serif !important" }}
          >
            {text}
          </Typography>
        );
      })}
    </Stack>
  );
}

import React from "react";
import { Stack, Typography, Skeleton } from "@mui/material";
import { ImageHandler } from "../../elements";
import { locale } from "@/src/app/data/locale";

export default function DashboardProfileCard({
  loader,
  mainClassName,
  ava,
  setAvatarModal,
  dataUser,
  studentProfile,
  head,
  displayLevel,
  levelElementRef,
  starElementRef,
  xpNumberRef,
  xpNumberValue,
  xpProgressValue,
  progressFillRef,
  showShimmer,
  statsContainerRef,
  handleStatHover,
  handleStatLeave,
  statsIconRefs,
  statsCounterRefs,
  dataSummary,
}) {
  return (
    <Stack className={mainClassName + "-flex-item-left"}>
      <Stack
        className={`${mainClassName}-profile-ava-wrapper dashboard-avatar-shine`}
        onClick={() => setAvatarModal(true)}
        sx={{
          cursor: "pointer",
          position: "relative",
          width: "200px",
          height: "fit-content",
        }}
      >
        {loader ? (
          <Skeleton variant="rounded" width="100%" height="100%" />
        ) : (
          <ImageHandler
            src={require(
              `@/images/illustration/illustration-profile${ava}.svg`,
            )}
            alt="ava"
            className={mainClassName + "-profile-ava"}
            borderRadius="20px"
          />
        )}
      </Stack>
      <Stack
        ml={2}
        width="100%"
        justifyContent={"space-between"}
        className={mainClassName + "-flex-item-left-content"}
      >
        <Typography
          fontSize={28}
          fontWeight={600}
          sx={{ fontFamily: "'Advercase', serif !important" }}
        >
          {dataUser?.name}
        </Typography>
        <Typography
          mt={1}
          fontSize={30}
          fontWeight={600}
          color="#FF5000"
          sx={{ fontFamily: "'Advercase', serif !important" }}
        >
          {locale(
            studentProfile?.days_since_joined > 1 ? head?.days : head?.day,
            { day: studentProfile?.days_since_joined },
          )}
        </Typography>
        <Stack mt={1}>
          <Stack width="100%" alignItems="flex-end">
            <Typography color="#FF5000" mr={2} mb={1} ref={levelElementRef}>
              lv {displayLevel}
            </Typography>
            <Stack direction="row" mb={1} alignItems="center">
              <ImageHandler
                src={require("@/images/icon/icon-star-yellow.png")}
                alt="ico coin"
                width={30}
                height={30}
                ref={starElementRef}
              />
              <Typography color="#231F20" fontWeight={400}>
                <span
                  ref={xpNumberRef}
                  style={{
                    fontSize: "20px",
                    fontWeight: 500,
                    transition: "all 0.3s ease-in-out",
                  }}
                >
                  {xpNumberValue}
                </span>{" "}
                /100 XP
              </Typography>
            </Stack>
          </Stack>
          <Stack width="100%" sx={{ position: "relative" }}>
            {}
            <Stack
              sx={{
                width: "100%",
                height: "10px",
                backgroundColor: "#E6E6E6",
                borderRadius: "5px",
                overflow: "hidden",
                position: "relative",
              }}
            >
              {}
              <Stack
                ref={progressFillRef}
                sx={{
                  width: `${xpProgressValue}%`,
                  height: "100%",
                  backgroundColor: "#00CDD2",
                  borderRadius: "5px",
                  transition: "width 1.5s cubic-bezier(0.4, 0, 0.2, 1)",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {}
                {showShimmer && (
                  <Stack
                    sx={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      background:
                        "linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)",
                      animation: "shimmer 1.5s ease-in-out",
                      "@keyframes shimmer": {
                        "0%": { transform: "translateX(-100%)" },
                        "100%": { transform: "translateX(100%)" },
                      },
                    }}
                  />
                )}
              </Stack>
            </Stack>
          </Stack>
        </Stack>
        <Stack
          ref={statsContainerRef}
          mt={3}
          direction="row"
          justifyContent="space-between"
          width="98%"
          className="dashboard-page-profile-stats-wrapper"
        >
          <Stack
            direction="row"
            alignItems="center"
            onMouseEnter={() => handleStatHover("submissions")}
            onMouseLeave={() => handleStatLeave("submissions")}
            sx={{ cursor: "pointer" }}
          >
            <ImageHandler
              src={require("@/images/icon/icon-submission.svg")}
              alt="Help"
              className={mainClassName + "-profile-stat-ico-1100"}
              width={62}
              height={62}
              ref={(el) => (statsIconRefs.current.submissions = el)}
            />
            <ImageHandler
              src={require("@/images/icon/icon-submission.svg")}
              alt="Help"
              className={mainClassName + "-profile-stat-ico-tablet"}
              width={40}
              height={40}
            />
            <Stack ml={2}>
              <Typography
                className={mainClassName + "-profile-stat-txt"}
                color="#FF64A0"
                sx={{ fontFamily: "'Advercase', serif !important" }}
                ref={(el) => (statsCounterRefs.current.submissions = el)}
              >
                {dataSummary === null ||
                dataSummary?.total_completed == null
                  ? "0"
                  : dataSummary.total_completed}
              </Typography>
              <Typography color="#8D8D8D">
                {locale(head?.noSubmission)}
              </Typography>
            </Stack>
          </Stack>
          <Stack
            direction="row"
            alignItems="center"
            onMouseEnter={() => handleStatHover("accuracy")}
            onMouseLeave={() => handleStatLeave("accuracy")}
            sx={{ cursor: "pointer" }}
          >
            <ImageHandler
              src={require("@/images/icon/icon-accuracy.svg")}
              alt="Help"
              className={mainClassName + "-profile-stat-ico-1100"}
              width={62}
              height={62}
              ref={(el) => (statsIconRefs.current.accuracy = el)}
            />
            <ImageHandler
              src={require("@/images/icon/icon-accuracy.svg")}
              alt="Help"
              className={mainClassName + "-profile-stat-ico-tablet"}
              width={40}
              height={40}
            />
            <Stack ml={2}>
              <Typography
                className={mainClassName + "-profile-stat-txt"}
                color="#8264FF"
                sx={{ fontFamily: "'Advercase', serif !important" }}
                ref={(el) => (statsCounterRefs.current.accuracy = el)}
              >
                {dataSummary === null ||
                dataSummary?.average_accuracy == null ||
                Number.isNaN(dataSummary.average_accuracy)
                  ? "0"
                  : (Number(dataSummary.average_accuracy) * 100).toFixed(2)}
                %
              </Typography>
              <Typography color="#8D8D8D">
                {locale(head?.avgAccuracy)}
              </Typography>
            </Stack>
          </Stack>
          <Stack
            direction="row"
            alignItems="center"
            onMouseEnter={() => handleStatHover("correct")}
            onMouseLeave={() => handleStatLeave("correct")}
            sx={{ cursor: "pointer" }}
          >
            <ImageHandler
              src={require("@/images/icon/icon-correct-answer.svg")}
              alt="Help"
              className={mainClassName + "-profile-stat-ico-1100"}
              width={62}
              height={62}
              ref={(el) => (statsIconRefs.current.correct = el)}
            />
            <ImageHandler
              src={require("@/images/icon/icon-correct-answer.svg")}
              alt="Help"
              className={mainClassName + "-profile-stat-ico-tablet"}
              width={40}
              height={40}
            />
            <Stack ml={2}>
              <Typography
                className={mainClassName + "-profile-stat-txt"}
                color="#FF8F00"
                sx={{ fontFamily: "'Advercase', serif !important" }}
                ref={(el) => (statsCounterRefs.current.correct = el)}
              >
                {dataSummary === null ||
                dataSummary?.total_fully_accurate == null
                  ? "0"
                  : dataSummary.total_fully_accurate}
              </Typography>
              <Typography color="#8D8D8D">
                {locale(head?.correctAnswer)}
              </Typography>
            </Stack>
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  );
}

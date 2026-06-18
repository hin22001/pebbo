import React, { Component } from "react";
import {
  Stack,
  Typography,
  Card,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import Lottie from "lottie-react";
import potterWalkAnimation from "@/assets/animations/Potter_walk.json";
import bobbyWalkAnimation from "@/assets/animations/bobbywalk.json";
import deskPotterThinkAnimation from "@/assets/animations/xuexi.json";
import deskBobbySleepAnimation from "@/assets/animations/sikao.json";
import { LeagueBadge } from "@/components/elements";
import { ImageHandler } from "@/components/elements";
import { ContentLayout } from "@/components/layouts/ContentLayout";

export default class LeaderboardPage extends Component {
  static defaultProps = {
    initialLeaderboard: null,
  };
  constructor(props) {
    super(props);
    this.state = {
      mainClassName: "leaderboard-page",
    };
  }

  getAvatarAnimation(avatarType, rank) {
    // For rank 2, use thinking animation for contemplative feel
    if (rank === 2) {
      return deskPotterThinkAnimation;
    }

    // For rank 3, use walk animation
    if (rank === 3) {
      return bobbyWalkAnimation;
    }

    // For ranks 4-5, use sleep animation for Bobby avatars
    if ((rank === 4 || rank === 5) && avatarType === "bobby") {
      return deskBobbySleepAnimation;
    }

    // For other ranks, use walk animations based on avatar type
    switch (avatarType) {
      case "bobby":
        return bobbyWalkAnimation;
      case "potter":
      default:
        return potterWalkAnimation;
    }
  }

  getRankLabel(rank) {
    const labels = {
      1: "1st",
      2: "2nd",
      3: "3rd",
    };
    return labels[rank] || `${rank}th`;
  }

  render() {
    const { mainClassName } = this.state;
    const { initialLeaderboard } = this.props;
    const data = initialLeaderboard ?? [];
    const top5 = data.slice(0, 5);
    const ranks6to20 = data.slice(5, 20);

    return (
      <ContentLayout>
        <Stack
          className={mainClassName}
          component={"main"}
          padding={"1rem"}
          marginTop={"1rem"}
          backgroundColor="#fff"
          borderRadius="20px"
        >
          {/* Header Section */}
          <Stack className={mainClassName + "-header"} mb={4}>
            <Typography
              color="#8264FF"
              fontSize={32}
              fontWeight={600}
              mb={1}
              sx={{ fontFamily: "'Advercase', serif !important" }}
            >
              🏆 Weekly Math Champions
            </Typography>
            <Typography fontWeight={400} fontSize={16} color="#666">
              Climb the leaderboard by mastering your daily math quests!
            </Typography>
          </Stack>

          {/* Top 5 Champions Section */}
          <Stack className={mainClassName + "-top-champions"} mb={4}>
            <Typography
              fontSize={24}
              fontWeight={600}
              mb={3}
              color="#231F20"
              sx={{ fontFamily: "'Advercase', serif !important" }}
            >
              Top Champions
            </Typography>
            <Stack
              direction="row"
              spacing={2}
              justifyContent="center"
              flexWrap="wrap"
              sx={{
                gap: 2,
                "@media (max-width: 768px)": {
                  flexDirection: "column",
                  alignItems: "center",
                },
              }}
            >
              {top5.map((player, index) => (
                <Card
                  key={player.id}
                  sx={{
                    width: { xs: "100%", sm: "180px", md: "200px" },
                    padding: 2,
                    borderRadius: "16px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    position: "relative",
                    border:
                      player.rank === 1
                        ? "3px solid #FFD700"
                        : player.rank === 2
                          ? "3px solid #C0C0C0"
                          : player.rank === 3
                            ? "3px solid #CD7F32"
                            : player.rank === 4 || player.rank === 5
                              ? "3px solid #8264FF"
                              : "2px solid transparent",
                    transition: "all 0.3s ease",
                    animation: `fadeInUp 0.6s ease ${index * 0.1}s both`,
                    "@keyframes fadeInUp": {
                      from: {
                        opacity: 0,
                        transform: "translateY(20px)",
                      },
                      to: {
                        opacity: 1,
                        transform: "translateY(0)",
                      },
                    },
                    "&:hover": {
                      transform: "translateY(-5px)",
                      boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
                    },
                  }}
                >
                  {/* Rank Badge */}
                  <Box
                    sx={{
                      position: "absolute",
                      top: -12,
                      left: 16,
                      backgroundColor:
                        player.rank === 1
                          ? "#FFD700"
                          : player.rank === 2
                            ? "#C0C0C0"
                            : player.rank === 3
                              ? "#CD7F32"
                              : player.rank === 4 || player.rank === 5
                                ? "#8264FF"
                                : "#8264FF",
                      color: "#000",
                      borderRadius: "50%",
                      width: 32,
                      height: 32,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      fontSize: 14,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                    }}
                  >
                    {player.rank}
                  </Box>

                  {/* Lottie Avatar */}
                  <Box
                    sx={{
                      width:
                        player.rank === 2 ||
                        ((player.rank === 4 || player.rank === 5) &&
                          player.avatar === "bobby")
                          ? 150
                          : 120,
                      height:
                        player.rank === 2 ||
                        ((player.rank === 4 || player.rank === 5) &&
                          player.avatar === "bobby")
                          ? 150
                          : 120,
                      mb: 1,
                      transition: "transform 0.3s ease",
                      "&:hover": {
                        transform: "scale(1.05)",
                      },
                    }}
                  >
                    <Lottie
                      animationData={this.getAvatarAnimation(
                        player.avatar,
                        player.rank,
                      )}
                      loop={true}
                      style={{ width: "100%", height: "100%" }}
                    />
                  </Box>

                  {/* Player Name */}
                  <Typography
                    fontWeight={600}
                    fontSize={16}
                    mb={1}
                    textAlign="center"
                  >
                    {player.name}
                  </Typography>

                  {/* League Badge */}
                  <Box mb={1}>
                    <LeagueBadge league={player.league} />
                  </Box>

                  {/* XP and Level */}
                  <Stack alignItems="center" spacing={0.5}>
                    <Typography fontSize={14} fontWeight={500}>
                      {player.coins ?? 0} Coins
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <ImageHandler
                        src={require("@/images/icon/icon-star-yellow.png")}
                        alt="star"
                        width={20}
                        height={20}
                      />
                      <Typography fontSize={14} fontWeight={500}>
                        {player.xp} XP
                      </Typography>
                    </Stack>
                    <Typography fontSize={14} color="#666">
                      Level {player.level}
                    </Typography>
                  </Stack>
                </Card>
              ))}
            </Stack>
          </Stack>

          {/* List View Section (Ranks 6-20) */}
          <Stack className={mainClassName + "-list-view"}>
            <Typography
              fontSize={24}
              fontWeight={600}
              mb={2}
              color="#231F20"
              sx={{ fontFamily: "'Advercase', serif !important" }}
            >
              Rankings (6-20)
            </Typography>
            <TableContainer
              component={Paper}
              sx={{
                borderRadius: "12px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              }}
            >
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#F5F5F5" }}>
                    <TableCell sx={{ fontWeight: 600 }}>Rank</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Player</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="center">
                      Coins
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="center">
                      XP
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="center">
                      Level
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="center">
                      League
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {ranks6to20.map((player, index) => (
                    <TableRow
                      key={player.id}
                      sx={{
                        animation: `fadeIn 0.4s ease ${index * 0.05}s both`,
                        "@keyframes fadeIn": {
                          from: {
                            opacity: 0,
                          },
                          to: {
                            opacity: 1,
                          },
                        },
                        "&:hover": {
                          backgroundColor: "#F9F9F9",
                          transform: "scale(1.01)",
                          transition: "all 0.2s ease",
                        },
                      }}
                    >
                      <TableCell>
                        <Typography fontWeight={600} fontSize={16}>
                          {player.rank}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Stack
                          direction="row"
                          alignItems="center"
                          spacing={1.5}
                        >
                          {/* Small Avatar Animation */}
                          <Box
                            sx={{
                              width: 60,
                              height: 60,
                              flexShrink: 0,
                            }}
                          >
                            <Lottie
                              animationData={this.getAvatarAnimation(
                                player.avatar,
                                player.rank,
                              )}
                              loop={true}
                              style={{ width: "100%", height: "100%" }}
                            />
                          </Box>
                          <Typography fontWeight={500} fontSize={15}>
                            {player.name}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell align="center">
                        <Typography fontSize={14} fontWeight={500}>
                          {player.coins ?? 0}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Stack
                          direction="row"
                          alignItems="center"
                          justifyContent="center"
                          spacing={0.5}
                        >
                          <ImageHandler
                            src={require("@/images/icon/icon-star-yellow.png")}
                            alt="star"
                            width={18}
                            height={18}
                          />
                          <Typography fontSize={14} fontWeight={500}>
                            {player.xp}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell align="center">
                        <Typography fontSize={14}>
                          Level {player.level}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <LeagueBadge league={player.league} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Stack>
        </Stack>
      </ContentLayout>
    );
  }
}

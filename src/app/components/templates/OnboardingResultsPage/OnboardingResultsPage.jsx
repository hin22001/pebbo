"use client";

import React, { Component } from "react";
import {
  Box,
  Stack,
  Typography,
  Button as ButtonMUI,
  LinearProgress,
  CircularProgress,
} from "@mui/material";
import Image from "next/image";
import Loader from "@/elements/loader/Loader";
import ContentLayout from "@/components/layouts/ContentLayout/ContentLayout";
import { withAppRouter } from "@/app/utils/withAppRouter";
import PaymentAPI from "@/app/data/api/PaymentAPI";

class OnboardingResultsPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: true,
      result: null,
      error: null,
      isLoadingCheckout: false,
      checkoutError: null,
    };
  }

  async componentDidMount() {
    const query = this.props.router?.query || {};
    const { score, total, percentile, grade_level } = query || {};

    if (score && total) {
      this.setState({
        isLoading: false,
        result: {
          score: parseInt(score),
          total: parseInt(total),
          percentile: parseFloat(percentile || 50),
          grade_level: grade_level || "?",
        },
      });
    } else {
      this.setState({
        isLoading: false,
        result: {
          score: 0,
          total: 0,
          percentile: 50,
          grade_level: "?",
        },
        error: score ? null : "No result data found.",
      });
    }
  }

  handleSubscribe = async () => {
    this.setState({ isLoadingCheckout: true, checkoutError: null });
    try {
      const response = await PaymentAPI.createCheckoutSession(
        {},
        { type: "monthly" },
      );

      const url = response?.payload?.data?.url;
      if (url) {
        window.location.href = url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (err) {
      this.setState({
        isLoadingCheckout: false,
        checkoutError: "Unable to start checkout. Please try again.",
      });
    }
  };

  render() {
    const { isLoading, error, result, isLoadingCheckout, checkoutError } =
      this.state;

    if (isLoading) {
      return (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="100vh"
        >
          <Loader />
        </Box>
      );
    }

    if (error) {
      return (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="100vh"
          px={3}
        >
          <Typography color="error">{error}</Typography>
        </Box>
      );
    }

    const { score, total, percentile, grade_level } = result;
    const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
        sx={{
          background: "linear-gradient(160deg, #F8FAFF 0%, #EEF3FF 100%)",
          px: 3,
          py: 6,
        }}
      >
        <Stack
          alignItems="center"
          spacing={4}
          maxWidth={520}
          width="100%"
          textAlign="center"
        >
          {/* Celebration GIF */}
          <Box
            sx={{
              width: 176,
              height: 176,
              borderRadius: "50%",
              background: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 16px 40px rgba(255, 165, 0, 0.35)",
              overflow: "hidden",
            }}
          >
            <Image
              src={
                Math.random() < 0.5
                  ? "/images/animation/woody_completed.gif"
                  : "/images/animation/potter_well_done.gif"
              }
              alt="Test complete celebration"
              width={148}
              height={148}
              style={{ objectFit: "contain" }}
              unoptimized
            />
          </Box>

          <Stack spacing={1}>
            <Typography
              variant="h4"
              fontWeight={700}
              sx={{
                background: "linear-gradient(90deg, #8264FF 0%, #00CDD2 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Test Complete!
            </Typography>
            <Typography variant="h6" color="text.secondary" fontWeight={400}>
              Here&apos;s how you did 🎉
            </Typography>
          </Stack>

          {/* Score card */}
          <Box
            sx={{
              width: "100%",
              background: "#fff",
              borderRadius: "20px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
              p: 4,
            }}
          >
            <Stack spacing={3}>
              {/* Big score */}
              <Box>
                <Typography
                  variant="h2"
                  fontWeight={800}
                  sx={{
                    background:
                      "linear-gradient(90deg, #8264FF 0%, #00CDD2 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {score}/{total}
                </Typography>
                <Typography color="text.secondary" fontSize="0.9rem">
                  questions correct
                </Typography>
              </Box>

              {/* Progress bar */}
              <Box>
                <Stack direction="row" justifyContent="space-between" mb={0.8}>
                  <Typography fontSize="0.8rem" color="text.secondary">
                    Score
                  </Typography>
                  <Typography
                    fontSize="0.8rem"
                    fontWeight={600}
                    color="#8264FF"
                  >
                    {percentage}%
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={percentage}
                  sx={{
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: "#EEE6FF",
                    "& .MuiLinearProgress-bar": {
                      background:
                        "linear-gradient(90deg, #8264FF 0%, #00CDD2 100%)",
                      borderRadius: 5,
                    },
                  }}
                />
              </Box>

              {/* Percentile */}
              <Box
                sx={{
                  background:
                    "linear-gradient(135deg, #F0EEFF 0%, #E8FFFE 100%)",
                  borderRadius: "12px",
                  p: 2,
                }}
              >
                <Typography fontWeight={600} color="#8264FF">
                  Top {Math.round(100 - percentile)}% of students
                </Typography>
                <Typography fontSize="0.85rem" color="text.secondary">
                  Grade {grade_level} level
                </Typography>
              </Box>
            </Stack>
          </Box>

          <Typography color="text.secondary" fontSize="0.95rem">
            Based on your score, we&apos;ve personalised your learning path.
            Subscribe to unlock it and start improving today!
          </Typography>

          {checkoutError && (
            <Typography color="error" fontSize="0.9rem">
              {checkoutError}
            </Typography>
          )}

          <ButtonMUI
            variant="contained"
            size="large"
            onClick={this.handleSubscribe}
            disabled={isLoadingCheckout}
            fullWidth
            sx={{
              py: 2,
              borderRadius: "14px",
              background: "linear-gradient(90deg, #8264FF 0%, #6D52E6 100%)",
              boxShadow: "0 8px 24px rgba(130, 100, 255, 0.4)",
              fontSize: "1.05rem",
              fontWeight: 600,
              textTransform: "none",
              "&:hover": {
                background: "linear-gradient(90deg, #7055EE 0%, #5D44D6 100%)",
              },
            }}
          >
            {isLoadingCheckout ? (
              <CircularProgress size={22} color="inherit" />
            ) : (
              "🚀 Unlock Your Learning Path"
            )}
          </ButtonMUI>
        </Stack>
      </Box>
    );
  }
}

export default withAppRouter(OnboardingResultsPage);

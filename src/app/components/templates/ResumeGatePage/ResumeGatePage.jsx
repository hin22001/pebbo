"use client";

import React, { Component } from "react";
import {
  Box,
  Stack,
  Typography,
  Button as ButtonMUI,
  CircularProgress,
} from "@mui/material";
import { withAppRouter } from "@/app/utils/withAppRouter";
import PaymentAPI from "@/app/data/api/PaymentAPI";

class ResumeGatePage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoadingCheckout: false,
      error: null,
    };
  }

  handleRetakeTest = () => {
    this.props.router.push("/onboarding/placement");
  };

  handleSubscribe = async () => {
    this.setState({ isLoadingCheckout: true, error: null });
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
        error: "Unable to start checkout. Please try again.",
      });
    }
  };

  render() {
    const { isLoadingCheckout, error } = this.state;

    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
        sx={{
          background: "linear-gradient(160deg, #FAF8FF 0%, #F0EEFF 100%)",
          px: 3,
        }}
      >
        <Stack
          alignItems="center"
          spacing={4}
          maxWidth={520}
          width="100%"
          textAlign="center"
        >
          {/* Icon */}
          <Box
            sx={{
              width: 130,
              height: 130,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #8264FF 0%, #A990FF 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "3.5rem",
              boxShadow: "0 12px 40px rgba(130, 100, 255, 0.3)",
            }}
          >
            🎓
          </Box>

          <Stack spacing={1.5}>
            <Typography
              variant="h4"
              fontWeight={700}
              sx={{
                background: "linear-gradient(90deg, #8264FF 0%, #A990FF 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Welcome Back!
            </Typography>
            <Typography variant="h6" color="text.secondary" fontWeight={400}>
              Your personalised learning path is ready
            </Typography>
            <Typography color="text.secondary" fontSize="0.95rem">
              Subscribe to unlock your full dashboard, exercises, and progress
              tracking — or retake the placement test to update your level.
            </Typography>
          </Stack>

          {error && (
            <Typography color="error" fontSize="0.9rem">
              {error}
            </Typography>
          )}

          <Stack spacing={2} width="100%">
            {/* Primary: Subscribe */}
            <ButtonMUI
              variant="contained"
              size="large"
              onClick={this.handleSubscribe}
              disabled={isLoadingCheckout}
              sx={{
                py: 1.8,
                borderRadius: "14px",
                background: "linear-gradient(90deg, #8264FF 0%, #6D52E6 100%)",
                boxShadow: "0 8px 24px rgba(130, 100, 255, 0.4)",
                fontSize: "1.05rem",
                fontWeight: 600,
                textTransform: "none",
                "&:hover": {
                  background:
                    "linear-gradient(90deg, #7055EE 0%, #5D44D6 100%)",
                },
              }}
            >
              {isLoadingCheckout ? (
                <CircularProgress size={22} color="inherit" />
              ) : (
                "🚀 Subscribe & Start Learning"
              )}
            </ButtonMUI>

            {/* Secondary: Retake test */}
            <ButtonMUI
              variant="outlined"
              size="large"
              onClick={this.handleRetakeTest}
              disabled={isLoadingCheckout}
              sx={{
                py: 1.8,
                borderRadius: "14px",
                borderColor: "#8264FF",
                color: "#8264FF",
                fontSize: "1.05rem",
                fontWeight: 600,
                textTransform: "none",
                "&:hover": {
                  backgroundColor: "rgba(130, 100, 255, 0.06)",
                  borderColor: "#6D52E6",
                },
              }}
            >
              📝 Retake Placement Test
            </ButtonMUI>
          </Stack>
        </Stack>
      </Box>
    );
  }
}

export default withAppRouter(ResumeGatePage);

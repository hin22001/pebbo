import React, { Component } from "react";
import {
  Stack,
  Typography,
  Box,
  Button,
  Chip,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from "@mui/material";
import { RewardCard } from "@/components/elements";
import { ImageHandler } from "@/components/elements";
import { ContentLayout } from "@/components/layouts/ContentLayout";
import { rewardsData } from "@/app/data/dummy/rewardsData";
import { Helpers } from "@/app/utils";

// Import sound file
const soundRewardUnlock = "/sounds/Win_Login_Popup_Reward_Popup_Screen.mp3";

export default class RewardPage extends Component {
  static defaultProps = {
    initialRewards: null,
  };

  constructor(props) {
    super(props);
    this.state = {
      mainClassName: "reward-page",
      selectedCategory: "all",
      coinBalance: 0,
      redeemedRewards: [],
      showMyRewards: false,
      confirmDialogOpen: false,
      selectedReward: null,
    };

    // Audio ref for reward unlock sound
    this.audioRefRewardUnlock = null;
  }

  componentDidMount() {
    this.loadCoinBalance();
    this.loadRedeemedRewards();
  }

  loadCoinBalance() {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("coinBalance");
      const balance = saved ? parseInt(saved) : 218; // Default to 218 if not set
      this.setState({ coinBalance: balance });
    }
  }

  loadRedeemedRewards() {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("redeemedRewards");
      const redeemed = saved ? JSON.parse(saved) : [];
      this.setState({ redeemedRewards: redeemed });
    }
  }

  handleCategoryChange = (category) => {
    this.setState({ selectedCategory: category });
  };

  getRewards = () => {
    return this.props.initialRewards ?? rewardsData;
  };

  handleRedeemClick = (rewardId) => {
    const reward = this.getRewards().find((r) => r.id === rewardId);
    if (!reward) return;

    const { coinBalance, redeemedRewards } = this.state;

    // Check if already redeemed
    if (redeemedRewards.some((r) => r.id === rewardId)) {
      Helpers.openSnackbar({
        message: "This reward has already been redeemed!",
        variant: "warning",
        autoHideDuration: 4000,
      });
      return;
    }

    // Check if can afford
    if (coinBalance < reward.cost) {
      Helpers.openSnackbar({
        message: `Insufficient coins! You need ${reward.cost} coins.`,
        variant: "error",
        autoHideDuration: 4000,
      });
      return;
    }

    // Open confirmation dialog
    this.setState({
      confirmDialogOpen: true,
      selectedReward: reward,
    });
  };

  handleConfirmRedeem = () => {
    const { selectedReward, coinBalance, redeemedRewards } = this.state;

    if (!selectedReward) return;

    // Deduct coins
    const newBalance = coinBalance - selectedReward.cost;

    // Save new balance
    if (typeof window !== "undefined") {
      localStorage.setItem("coinBalance", newBalance.toString());

      // Add to redeemed rewards
      const newRedeemedReward = {
        id: selectedReward.id,
        name: selectedReward.name,
        category: selectedReward.category,
        cost: selectedReward.cost,
        description: selectedReward.description,
        image: selectedReward.image,
        redeemedAt: new Date().toISOString(),
      };

      const updatedRedeemedRewards = [...redeemedRewards, newRedeemedReward];
      localStorage.setItem(
        "redeemedRewards",
        JSON.stringify(updatedRedeemedRewards),
      );

      // Trigger coin balance update in other components (if CoinBalanceModule is mounted)
      if (window.triggerCoinIncrement) {
        // Trigger a negative update to sync balance
        const event = new CustomEvent("coinBalanceUpdated", {
          detail: { newBalance },
        });
        window.dispatchEvent(event);
      }
    }

    // Update state
    this.setState({
      coinBalance: newBalance,
      redeemedRewards: [
        ...redeemedRewards,
        {
          id: selectedReward.id,
          name: selectedReward.name,
          category: selectedReward.category,
          cost: selectedReward.cost,
          description: selectedReward.description,
          image: selectedReward.image,
          redeemedAt: new Date().toISOString(),
        },
      ],
      confirmDialogOpen: false,
      selectedReward: null,
    });

    // Play reward unlock sound
    this.playRewardUnlockSound();

    // Show success toast
    Helpers.openSnackbar({
      message: `Successfully redeemed: ${selectedReward.name}!`,
      variant: "success",
      autoHideDuration: 4000,
    });
  };

  handleCancelRedeem = () => {
    this.setState({
      confirmDialogOpen: false,
      selectedReward: null,
    });
  };

  // Play reward unlock sound
  playRewardUnlockSound() {
    const soundEnabled = localStorage.getItem("soundEnabled") !== "false";
    if (!soundEnabled) return;

    if (!this.audioRefRewardUnlock) {
      this.audioRefRewardUnlock = new Audio(soundRewardUnlock);
    }

    this.audioRefRewardUnlock.currentTime = 0;
    this.audioRefRewardUnlock.play().catch((err) => {
      console.error("Error playing reward unlock sound:", err);
    });
  }

  checkCanAfford = (cost) => {
    return this.state.coinBalance >= cost;
  };

  isRedeemed = (rewardId) => {
    return this.state.redeemedRewards.some((r) => r.id === rewardId);
  };

  filterRewardsByCategory = () => {
    const { selectedCategory } = this.state;
    const rewards = this.getRewards();
    if (selectedCategory === "all") {
      return rewards;
    }
    return rewards.filter((reward) => reward.category === selectedCategory);
  };

  toggleMyRewards = () => {
    this.setState({ showMyRewards: !this.state.showMyRewards });
  };

  render() {
    const {
      mainClassName,
      selectedCategory,
      coinBalance,
      redeemedRewards,
      showMyRewards,
      confirmDialogOpen,
      selectedReward,
    } = this.state;
    const filteredRewards = this.filterRewardsByCategory();

    const categories = [
      { value: "all", label: "All" },
      { value: "stationery", label: "Stationery" },
      { value: "toys", label: "Toys" },
    ];

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
              🎁 Reward Store
            </Typography>
            <Typography fontWeight={400} fontSize={16} color="#666" mb={2}>
              Exchange your coins for amazing stationery and toys!
            </Typography>

            {/* Coin Balance Display */}
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="center"
              spacing={1}
              mb={2}
              sx={{
                backgroundColor: "#F5F5F5",
                borderRadius: "12px",
                padding: "12px 24px",
                display: "inline-flex",
                alignSelf: "center",
              }}
            >
              <ImageHandler
                src={require("@/images/icon/icon-star-yellow.png")}
                alt="coin"
                width={28}
                height={28}
              />
              <Typography
                fontSize={24}
                fontWeight={700}
                color="#FFD700"
                sx={{ fontFamily: "'Advercase', serif !important" }}
              >
                {coinBalance}
              </Typography>
              <Typography fontSize={16} fontWeight={500} color="#666">
                Coins Available
              </Typography>
            </Stack>
          </Stack>

          {/* Category Filters */}
          <Stack
            direction="row"
            spacing={2}
            justifyContent="center"
            mb={4}
            flexWrap="wrap"
            sx={{ gap: 1 }}
          >
            {categories.map((category) => (
              <Chip
                key={category.value}
                label={category.label}
                onClick={() => this.handleCategoryChange(category.value)}
                sx={{
                  backgroundColor:
                    selectedCategory === category.value ? "#8264FF" : "#F5F5F5",
                  color:
                    selectedCategory === category.value ? "#FFF" : "#231F20",
                  fontWeight: 600,
                  fontSize: 14,
                  padding: "8px 16px",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    backgroundColor:
                      selectedCategory === category.value
                        ? "#6d52e6"
                        : "#E0E0E0",
                    transform: "translateY(-2px)",
                  },
                }}
              />
            ))}
          </Stack>

          {/* Rewards Grid */}
          <Stack className={mainClassName + "-rewards-grid"} mb={4}>
            <Typography
              fontSize={24}
              fontWeight={600}
              mb={3}
              color="#231F20"
              sx={{ fontFamily: "'Advercase', serif !important" }}
            >
              Available Rewards ({filteredRewards.length})
            </Typography>
            <Grid
              container
              spacing={3}
              sx={{
                justifyContent: "center",
                "@media (max-width: 768px)": {
                  justifyContent: "center",
                },
              }}
            >
              {filteredRewards.map((reward) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={reward.id}>
                  <RewardCard
                    reward={reward}
                    onRedeem={this.handleRedeemClick}
                    canAfford={this.checkCanAfford(reward.cost)}
                    isRedeemed={this.isRedeemed(reward.id)}
                  />
                </Grid>
              ))}
            </Grid>
          </Stack>

          {/* My Rewards Section */}
          <Stack className={mainClassName + "-my-rewards"}>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              mb={2}
            >
              <Typography
                fontSize={24}
                fontWeight={600}
                color="#231F20"
                sx={{ fontFamily: "'Advercase', serif !important" }}
              >
                My Rewards ({redeemedRewards.length})
              </Typography>
              <Button
                variant="outlined"
                onClick={this.toggleMyRewards}
                sx={{
                  borderColor: "#8264FF",
                  color: "#8264FF",
                  fontWeight: 600,
                  borderRadius: "8px",
                  textTransform: "none",
                }}
              >
                {showMyRewards ? "Hide" : "Show"}
              </Button>
            </Stack>

            {showMyRewards && (
              <>
                {redeemedRewards.length === 0 ? (
                  <Stack alignItems="center" justifyContent="center" p={4}>
                    <Typography fontSize={16} color="#666">
                      You haven't redeemed any rewards yet. Start redeeming to
                      see them here!
                    </Typography>
                  </Stack>
                ) : (
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
                          <TableCell sx={{ fontWeight: 600 }}>Item</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                          <TableCell sx={{ fontWeight: 600 }} align="center">
                            Category
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600 }} align="center">
                            Cost
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600 }} align="center">
                            Redeemed On
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {redeemedRewards.map((redeemed, index) => (
                          <TableRow
                            key={index}
                            sx={{
                              "&:hover": {
                                backgroundColor: "#F9F9F9",
                              },
                            }}
                          >
                            <TableCell>
                              <ImageHandler
                                src={redeemed.image}
                                alt={redeemed.name}
                                width={40}
                                height={40}
                              />
                            </TableCell>
                            <TableCell>
                              <Typography fontWeight={500} fontSize={15}>
                                {redeemed.name}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Chip
                                label={
                                  redeemed.category.charAt(0).toUpperCase() +
                                  redeemed.category.slice(1)
                                }
                                size="small"
                                sx={{
                                  backgroundColor:
                                    redeemed.category === "stationery"
                                      ? "#8264FF"
                                      : "#FF5000",
                                  color: "#FFF",
                                  fontWeight: 600,
                                }}
                              />
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
                                  alt="coin"
                                  width={18}
                                  height={18}
                                />
                                <Typography fontSize={14} fontWeight={500}>
                                  {redeemed.cost}
                                </Typography>
                              </Stack>
                            </TableCell>
                            <TableCell align="center">
                              <Typography fontSize={14} color="#666">
                                {new Date(
                                  redeemed.redeemedAt,
                                ).toLocaleDateString()}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </>
            )}
          </Stack>

          {/* Confirmation Dialog */}
          <Dialog
            open={confirmDialogOpen}
            onClose={this.handleCancelRedeem}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle sx={{ color: "#8264FF", fontWeight: 600 }}>
              Confirm Redemption
            </DialogTitle>
            <DialogContent>
              {selectedReward && (
                <Stack spacing={2}>
                  <DialogContentText>
                    Are you sure you want to redeem{" "}
                    <strong>{selectedReward.name}</strong> for{" "}
                    <strong>{selectedReward.cost} coins</strong>?
                  </DialogContentText>
                  <Stack
                    direction="row"
                    spacing={2}
                    alignItems="center"
                    sx={{
                      backgroundColor: "#F5F5F5",
                      borderRadius: "8px",
                      padding: "12px",
                    }}
                  >
                    <ImageHandler
                      src={selectedReward.image}
                      alt={selectedReward.name}
                      width={60}
                      height={60}
                    />
                    <Stack>
                      <Typography fontWeight={600} fontSize={16}>
                        {selectedReward.name}
                      </Typography>
                      <Typography fontSize={14} color="#666">
                        {selectedReward.description}
                      </Typography>
                    </Stack>
                  </Stack>
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="center"
                    spacing={1}
                    sx={{
                      backgroundColor: "#FFF9E6",
                      borderRadius: "8px",
                      padding: "12px",
                    }}
                  >
                    <ImageHandler
                      src={require("@/images/icon/icon-star-yellow.png")}
                      alt="coin"
                      width={24}
                      height={24}
                    />
                    <Typography fontSize={18} fontWeight={700} color="#FFD700">
                      {coinBalance} → {coinBalance - selectedReward.cost}
                    </Typography>
                    <Typography fontSize={14} color="#666">
                      coins remaining
                    </Typography>
                  </Stack>
                </Stack>
              )}
            </DialogContent>
            <DialogActions sx={{ padding: "16px 24px" }}>
              <Button
                onClick={this.handleCancelRedeem}
                sx={{
                  color: "#666",
                  fontWeight: 600,
                  textTransform: "none",
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={this.handleConfirmRedeem}
                variant="contained"
                sx={{
                  backgroundColor: "#8264FF",
                  color: "#FFF",
                  fontWeight: 600,
                  textTransform: "none",
                  borderRadius: "8px",
                  px: 3,
                  "&:hover": {
                    backgroundColor: "#6d52e6",
                  },
                }}
              >
                Confirm Redeem
              </Button>
            </DialogActions>
          </Dialog>
        </Stack>
      </ContentLayout>
    );
  }
}

"use client";
import React, { useState, useLayoutEffect, useRef } from "react";
import { Stack, Box, Typography, Container } from "@mui/material";
import { useUser } from "@/app/contexts/UserContext";
import ShopHeader from "./ShopHeader";
import ShopTabs from "./ShopTabs";
import ShopItemCard from "./ShopItemCard";
import PurchaseModal from "./PurchaseModal";
import Lottie from "lottie-react";
import woodyThinkAnimation from "@/app/assets/animations/sikao.json";
import gsap from "gsap";

const mockShopItems = {
  boosters: [
    {
      id: 1,
      name: "Energy Refill",
      description: "+20 Energy",
      price: 50,
      icon: "/icons/shop/energy.svg",
      type: "energy",
    },
    {
      id: 2,
      name: "Hint Token",
      description: "Reveals a step",
      price: 30,
      icon: "/icons/shop/hint.svg",
      type: "hint",
    },
    {
      id: 3,
      name: "Time Freeze",
      description: "Pause timer",
      price: 40,
      icon: "/icons/shop/timer.svg",
      type: "timer",
    },
    {
      id: 4,
      name: "Double Reward",
      description: "2× Coins",
      price: 80,
      icon: "/icons/shop/double.svg",
      type: "multiplier",
    },
  ],
  puzzle: [
    {
      id: 5,
      name: "Puzzle Fragment Pack",
      description: "Random map piece",
      price: 100,
      icon: "/icons/shop/puzzle.svg",
      type: "puzzle",
    },
    {
      id: 6,
      name: "Missing Piece Finder",
      description: "Highlights gaps",
      price: 60,
      icon: "/icons/shop/search.svg",
      type: "tool",
    },
  ],
  custom: [
    {
      id: 7,
      name: "Blue Woody Skin",
      description: "Visual only",
      price: 200,
      icon: "/icons/shop/skin_blue.svg",
      type: "cosmetic",
    },
    {
      id: 8,
      name: "Space Map Theme",
      description: "Background change",
      price: 300,
      icon: "/icons/shop/theme_space.svg",
      type: "cosmetic",
    },
    {
      id: 9,
      name: "Legendary Frame",
      description: "Cosmetic border",
      price: 150,
      icon: "/icons/shop/frame_gold.svg",
      type: "cosmetic",
    },
  ],
};

const Shop = ({ initialItems }) => {
  const mainClassName = "template-shop";

  const dataUser = useUser();
  const shopItems = initialItems ?? mockShopItems;

  const [activeTab, setActiveTab] = useState("boosters");
  const [selectedItem, setSelectedItem] = useState(null);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const rootRef = useRef(null);
  const isFirstMount = useRef(true);

  // Card grid: animate on tab change only (no GSAP on header coins/energy/tokens)
  useLayoutEffect(() => {
    if (!rootRef.current) return;
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    const ctx = gsap.context(() => {
      gsap.set(".template-shop-item-card", { clearProps: "all" });
      gsap.from(".template-shop-item-card", {
        y: 30,
        opacity: 0,
        stagger: 0.05,
        duration: 0.5,
        ease: "power2.out",
        clearProps: "all",
      });
    }, rootRef);
    return () => ctx.revert();
  }, [activeTab]);

  const handleBuyClick = (item) => {
    setSelectedItem(item);
    setIsPurchaseModalOpen(true);
  };

  const handleConfirmPurchase = () => {
    console.log("Purchase confirmed for:", selectedItem?.name);
    setIsPurchaseModalOpen(false);
    // Success feedback logic here
  };

  return (
    <Stack ref={rootRef} className={mainClassName} sx={{ pb: 8 }}>
      <ShopHeader dataUser={dataUser} />

      <Container maxWidth="lg" className={mainClassName + "-container"}>
        <Stack spacing={4} py={4}>
          <Typography
            variant="h4"
            fontWeight={800}
            textAlign="center"
            sx={{ color: "#333" }}
          >
            Pebbo Magic Shop
          </Typography>

          <ShopTabs activeTab={activeTab} onTabChange={setActiveTab} />

          <Box className={mainClassName + "-grid-wrapper"}>
            <Stack
              direction="row"
              flexWrap="wrap"
              gap={3}
              justifyContent="center"
              className={mainClassName + "-item-grid"}
            >
              {shopItems[activeTab]?.map((item) => (
                <ShopItemCard
                  key={item.id}
                  item={item}
                  onBuy={() => handleBuyClick(item)}
                />
              ))}
            </Stack>
          </Box>
        </Stack>
      </Container>

      {/* Bottom Panel: Mr. Woody Tips */}
      <Box
        className={mainClassName + "-bottom-panel"}
        sx={{
          mt: 4,
          mx: "auto",
          maxWidth: 700,
          background: "rgba(255, 255, 255, 0.7)",
          backdropFilter: "blur(10px)",
          borderRadius: "32px",
          border: "1px solid rgba(0,0,0,0.05)",
          p: 3,
          display: "flex",
          alignItems: "center",
          gap: 3,
        }}
      >
        <Box sx={{ width: 100, height: 100 }}>
          <Lottie animationData={woodyThinkAnimation} loop={true} />
        </Box>
        <Stack spacing={0.5}>
          <Typography variant="subtitle1" fontWeight={800} color="#333">
            Mr. Woody's Shop Tip
          </Typography>
          <Typography variant="body2" color="#666">
            "Don't forget to grab an Energy Refill if you're planning a long
            study session! It'll keep you going for more challenges."
          </Typography>
        </Stack>
      </Box>

      <PurchaseModal
        isOpen={isPurchaseModalOpen}
        onClose={() => setIsPurchaseModalOpen(false)}
        onConfirm={handleConfirmPurchase}
        item={selectedItem}
      />
    </Stack>
  );
};

export default Shop;

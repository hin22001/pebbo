"use client";
import React, { useEffect } from "react";
import Lottie from "lottie-react";
import congratsAnimation from "@/assets/animations/congrats.json";

export default function Congratulations(props) {
  const { isOpen, resetModal } = props;

  // Auto-close after 4 seconds
  useEffect(() => {
    if (isOpen && resetModal) {
      const timer = setTimeout(() => {
        resetModal();
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [isOpen, resetModal]);

  try {
    if (typeof window != "undefined" && isOpen) {
      return (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            pointerEvents: "none",
            backgroundColor: "transparent",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Lottie
              animationData={congratsAnimation}
              loop={true}
              style={{ width: 200, height: 200 }}
            />
          </div>
        </div>
      );
    } else {
      return null;
    }
  } catch (err) {
    return null;
  }
}

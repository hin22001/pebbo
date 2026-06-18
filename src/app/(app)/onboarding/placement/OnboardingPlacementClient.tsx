"use client";

import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { assignMainLayout } from "@/app/contexts/redux/actions";
import PlacementTestPage from "@/components/templates/PlacementTestPage/PlacementTestPage";

type OnboardingPlacementClientProps = {
  initialQuestions?: any[];
};

export default function OnboardingPlacementClient({
  initialQuestions = [],
}: OnboardingPlacementClientProps) {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(
      assignMainLayout({
        activeScreen: "onboarding-placement",
      }),
    );
  }, [dispatch]);

  return <PlacementTestPage initialQuestions={initialQuestions} />;
}


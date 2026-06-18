"use client";

import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { assignMainLayout } from "@/app/contexts/redux/actions";
import OnboardingResultsPage from "@/components/templates/OnboardingResultsPage/OnboardingResultsPage";

export default function OnboardingResultsClient() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(
      assignMainLayout({
        isDisabledHeader: true,
        isDisabledFooter: true,
        classNameContentMain: "content-main-white",
      }),
    );
  }, [dispatch]);

  return <OnboardingResultsPage />;
}


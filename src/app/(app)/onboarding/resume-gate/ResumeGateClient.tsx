"use client";

import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { assignMainLayout } from "@/app/contexts/redux/actions";
import ResumeGatePage from "@/components/templates/ResumeGatePage/ResumeGatePage";

export default function ResumeGateClient() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(
      assignMainLayout({
        isDisabledHeader: true,
        isDisabledFooter: true,
      }),
    );
  }, [dispatch]);

  return <ResumeGatePage />;
}


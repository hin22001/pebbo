"use client";

import React from "react";
import { ContentLayout } from "@/app/components/layouts/ContentLayout";
import { StudentCard } from "@/app/components/modules";
import { Stack, Typography } from "@mui/material";
import { ImageHandler } from "@/app/components/elements";
import { locale } from "@/app/data/locale";
import { getDataHead } from "@/app/data/head";

export default function StudentInboxClient() {
  const head = getDataHead({ name: "headDashboardPage" });

  return (
    <ContentLayout>
      <StudentCard wrapper={true}>
        <Stack width="100%" alignItems="center">
          <Stack
            backgroundColor="#fff"
            p={2}
            m={2}
            borderRadius={5}
            height="80vh"
            width="90%"
            maxWidth="1300px"
            alignItems="center"
            justifyContent="center"
          >
            <ImageHandler
              src={require("@/images/illustration/illustration-mascot-math.png")}
              alt="img"
              width={300}
              height={300}
            />
            <Typography mt={5} fontWeight={700} fontSize={30}>
              {locale(head?.newFeatureComing)}
            </Typography>
          </Stack>
          {/* <Invitations /> */}
        </Stack>
      </StudentCard>
    </ContentLayout>
  );
}


"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LoginAPI } from "@/app/data/api";
import { Button } from "@/elements";
import Image from "next/image";
import ContentLayout from "@/layouts/ContentLayout/ContentLayout";
import { getDataHead } from "@/app/data/head";
import { locale } from "@/app/data/locale";

export default function PaymentSuccessClient() {
  const router = useRouter();
  const [authRedirect, setAuthRedirect] = useState("/login");
  const [head, setHead] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    const headData = getDataHead({ name: "headDashboardPage" });
    if (headData) setHead(headData as Record<string, unknown>);
  }, []);

  useEffect(() => {
    LoginAPI.getIsAuth().then((data) => {
      if (data?.status === 200) setAuthRedirect("/dashboard");
    });
  }, []);

  return (
    <ContentLayout
      title={locale(head?.paymentSuccess)}
      theme="full light-grey disable-padding disable-border"
      hideTitle={true}
      access={true}
    >
      <main>
        <div className="dashboard-page-payment-wrapper">
          <div>
            <Image
              width={400}
              src={require("@/images/illustration/illustration-mascot-surfing-2.png")}
              alt="Payment success"
            />
          </div>
          <div className="dashboard-page-payment-title">
            {locale(head?.paymentSuccess)}
          </div>
          <Button
            handleClick={() => router.push(authRedirect)}
            label={locale(head?.startJourney)}
          />
        </div>
      </main>
    </ContentLayout>
  );
}

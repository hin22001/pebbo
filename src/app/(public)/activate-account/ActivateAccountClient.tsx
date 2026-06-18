"use client";

import React, { useState } from "react";
import { LoginAPI } from "@/app/data/api";
import { Button } from "@/elements";
import Image from "next/image";
import ContentLayout from "@/layouts/ContentLayout/ContentLayout";
import { Link, Stack, TextField } from "@mui/material";
import { Loader } from "@/app/components/elements";
import { Helpers } from "@/app/utils";

export default function ActivateAccountClient() {
  const [activationCode, setActivationCode] = useState(false);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const sendActivate = async () => {
    try {
      setLoading(true);
      const res = await LoginAPI.postActivateKey({}, { key: code });
      if (res?.payload?.status === 200) {
        setCode("");
        Helpers.openSnackbar({
          variant: "success",
          message: "Success",
          autoHideDuration: 3000,
        });
        setTimeout(() => {
          window.location.replace(Helpers.hrefLocale("/dashboard"));
        }, 1000);
      } else {
        Helpers.openSnackbar({ message: res?.message });
      }
    } catch (error) {
      Helpers.openSnackbar({ message: (error as Error)?.message ?? String(error) });
    } finally {
      setLoading(false);
    }
  };

  const subscribe = () => {
    const url = typeof window !== "undefined" ? localStorage.getItem("subscribeUrl") : null;
    if (url) window.open(url, "_blank");
  };

  return (
    <ContentLayout
      title="Activate Account"
      theme="full light-grey disable-padding disable-border"
      hideTitle={true}
      access={true}
    >
      <main>
        <div className="dashboard-page-payment-wrapper">
          <Loader isOpen={loading} />
          <div>
            <Image
              width={400}
              src={require("@/images/illustration/illustration-mascot-math.png")}
              alt="Activate account"
            />
          </div>
          <div className="dashboard-page-payment-title">
            Activate Your Account
          </div>
          {!activationCode ? (
            <Stack>
              <Button handleClick={subscribe} label="Subscribe" />
            </Stack>
          ) : (
            <Stack
              width="30%"
              direction="row"
              alignItems="center"
              justifyContent="center"
            >
              <TextField
                value={code}
                onChange={(e) => setCode(e?.target?.value ?? "")}
                sx={{ width: "300px" }}
                placeholder="Your activation key"
              />
              <Stack ml={2}>
                <Button handleClick={sendActivate} label="Activate" />
              </Stack>
            </Stack>
          )}

          <Link
            component="button"
            type="button"
            style={{ marginTop: "1rem" }}
            onClick={() => setActivationCode(!activationCode)}
            color="primary"
            underline="none"
            className="role-link"
          >
            {activationCode ? "Subscribe" : "Use activation key"}
          </Link>
        </div>
      </main>
    </ContentLayout>
  );
}

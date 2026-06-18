import axios from "axios";
import { Config } from "@/app/constant";
import _ from "lodash";
import { Helpers } from "../utils";
import { Auth } from "@/app/data/local";

// Debounce flag to prevent multiple logout attempts
let isLoggingOut = false;

const handleUnauthorized = async () => {
  if (isLoggingOut) return;

  // Check if we're already on a public page - don't trigger logout loop
  if (typeof window !== "undefined") {
    const currentPath = window.location.pathname;
    const publicPaths = Auth.whiteListPath || [];

    // Normalize path to check against whitelist (handle trailing slashes and locales)
    const isPublicPage = publicPaths.some((path) => {
      if (path === "/")
        return (
          currentPath === "/" || currentPath === "/en" || currentPath === "/zh"
        );
      return (
        currentPath === path ||
        currentPath === path + "/" ||
        currentPath.replace(/\/$/, "") === path
      );
    });

    if (isPublicPage) {
      return; // Already on public page, no need to logout or alert
    }
  }

  isLoggingOut = true;

  try {
    Helpers.openSnackbar({
      name: "sessionTimeout",
      autoHideDuration: 3000,
    });
    await Auth.logout();
  } catch (err) {
    console.error("Logout failed:", err);
  } finally {
    // Reset after a delay to allow for page redirect
    setTimeout(() => {
      isLoggingOut = false;
    }, 5000);
  }
};

// api will called twice on development when set reactStrictMode: true
export const stream = ({
  url,
  method,
  params = {},
  data,
  useToken = false,
}) => {
  const config = {
    method: method,
    url: url,
    params: {
      ...(params || {}),
      region: Helpers.getCurrentLanguage(),
    },
    responseType: "json",
    ...(data ? { data: data } : {}),
  };

  return axios(config)
    .then(async (response) => {
      if (response?.code == 401 || response?.status == 401) {
        await handleUnauthorized();
      }

      if (response.status == 201 || response.status == 200) {
        const _err = 0;
        const payload = response.data;
        const status = response.status;
        const success = true;

        return { _err, payload, status, success };
      } else {
        const _err = 1;
        const message = response.data?.message || "Unknown error";
        const status = response.data?.status || response.status;
        const success = false;

        return { _err, message, status, success };
      }
    })
    .catch(async (error) => {
      console.log(
        "ConnectionManager There has been a problem with your fetch operation: " +
          error.message,
      );

      if (error?.response?.code == 401 || error?.response?.status == 401) {
        await handleUnauthorized();
      }

      const _err = 1;
      const message =
        error?.response?.data?.message ||
        "There was an issue with your request. Please check and try again.";
      const status =
        error?.response?.data?.status || error?.response?.status || 500;
      const success = false;

      return { _err, message, status, success };
    });
};

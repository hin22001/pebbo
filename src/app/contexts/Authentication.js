import React from "react";
import { connect } from "react-redux";
import Auth from "@/app/data/local/Auth";
import { assignAuthentication } from "@/app/contexts/redux/actions";
import { Loader } from "@/elements";
import { Helpers } from "@/src/app/utils";
import {
  PUBLIC_PATHS,
  UNPAID_STUDENT_ALLOWED_PATHS,
} from "@/app/config/authRoutes";

export const Authentication = (props) => {
  const { children, assignAuthentication } = props;

  const [isLoaderOpen, setLoader] = React.useState(true);
  const [renderAuth, setRenderAuth] = React.useState(false);
  const [pathname, setPathname] = React.useState("");

  // Safety timeout for loader
  React.useEffect(() => {
    if (isLoaderOpen) {
      const timer = setTimeout(() => {
        setLoader(false);
        // If we timeout, we might as well try to render if possible
        if (!renderAuth) {
          const userData = Auth.getDataUser();
          if (userData) setRenderAuth(true);
        }
      }, 10000); // 10 seconds safety
      return () => clearTimeout(timer);
    }
  }, [isLoaderOpen, renderAuth]);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      setPathname(window.location.pathname);

      try {
        const Router = require("next/router");
        if (Router?.default?.events) {
          const handleRouteChange = (url) => setPathname(url.split("?")[0]);
          Router.default.events.on("routeChangeComplete", handleRouteChange);
          return () =>
            Router.default.events.off("routeChangeComplete", handleRouteChange);
        }
      } catch (e) {
        // App Router context
      }
    }
  }, []);

  const isProtectedStudentPath = React.useCallback((path) => {
    if (!path) return false;
    if (PUBLIC_PATHS.includes(path)) return false;
    if (path.startsWith("/api")) return false;
    return true;
  }, []);

  React.useEffect(() => {
    let isMounted = true;
    const currentPath =
      pathname ||
      (typeof window !== "undefined" ? window.location.pathname : "");

    const checkAuth = async () => {
      try {
        console.log("Checking auth for path:", currentPath);
        const isAuthenticated = await Auth.isAuthenticated();
        if (!isMounted) return;

        let dataUser = Auth.getDataUser();
        const authUser = dataUser != null;
        const isWhiteList = PUBLIC_PATHS.includes(currentPath);

        if (isAuthenticated) {
          const isStudent = dataUser?.role?.name === "Student";

          // Always prefer authoritative onboarding/paying flags from backend
          // for authenticated student gate decisions.
          if (isStudent) {
            const refreshedUser = await Auth.refreshCurrentUser();
            if (refreshedUser) {
              dataUser = refreshedUser;
            }
          }

          if (isStudent) {
            const isOnboardingPath = currentPath.startsWith("/onboarding/");
            const isPaymentSuccessPath =
              currentPath.startsWith("/payment-success");

            if (
              !dataUser?.onboarding_completed &&
              !isOnboardingPath &&
              !isWhiteList
            ) {
              Helpers.changeRouter("/onboarding/placement");
              setLoader(false);
              return;
            }

            if (
              dataUser?.onboarding_completed &&
              !dataUser?.paying &&
              !isPaymentSuccessPath &&
              !UNPAID_STUDENT_ALLOWED_PATHS.includes(currentPath) &&
              !isWhiteList
            ) {
              Helpers.changeRouter("/onboarding/resume-gate");
              setLoader(false);
              return;
            }
          }

          if (isWhiteList || authUser) {
            setRenderAuth(true);
          } else {
            console.warn(
              "Authenticated but no user data, redirecting to login",
            );
            window.location.replace("/login");
          }
        } else if (!isWhiteList) {
          console.warn(
            "Not authenticated and not white-listed, redirecting to login",
          );
          Helpers.changeRouter("/login");
        } else {
          setRenderAuth(true);
        }

        setLoader(false);
      } catch (err) {
        console.error("Auth check error in Authentication.js:", err);
        if (isMounted) {
          setLoader(false);
          // Fail closed for protected student routes. Keep public behavior intact.
          if (isProtectedStudentPath(currentPath)) {
            Helpers.changeRouter("/onboarding/placement");
            return;
          }
          setRenderAuth(true);
        }
      }
    };

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, [pathname, isProtectedStudentPath]);

  return (
    <>
      {isLoaderOpen && <Loader isOpen={true} resetModal={true} />}
      {renderAuth && children}
    </>
  );
};

const mapStateToProps = (state) => {
  return {
    ...(state.authentication || {}),
  };
};

const mapDispatchToProps = { assignAuthentication };

export default connect(mapStateToProps, mapDispatchToProps)(Authentication);

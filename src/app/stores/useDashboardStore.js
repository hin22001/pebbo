import { create } from "zustand";
import UserAPI from "@/app/data/api/UserAPI";

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

const useDashboardStore = create((set, get) => ({
  data: null,
  timestamp: null,
  isLoading: false,
  error: null,

  primeDashboard: (data) => {
    if (!data) return;

    set({
      data,
      timestamp: Date.now(),
      isLoading: false,
      error: null,
    });
  },

  /**
   * Fetch dashboard data with caching
   * - Returns cached data instantly if available
   * - Silently revalidates in background if cache exists
   * - Shows loader only if no cache exists
   */
  fetchDashboard: async (year, force = false) => {
    const state = get();
    const now = Date.now();
    const cacheAge = state.timestamp ? now - state.timestamp : Infinity;
    const isCacheValid = cacheAge < CACHE_TTL;

    // If we have valid cache and not forcing, return it and revalidate silently
    if (state.data && isCacheValid && !force) {
      console.log(
        `📦 Dashboard cache hit (${Math.round(cacheAge / 1000)}s old) - showing cache, revalidating in background`,
      );

      // Return cached data immediately
      const cachedData = state.data;

      // Silently revalidate in background
      setTimeout(async () => {
        try {
          console.log("🔄 Silent revalidation started");
          const dashRes = await UserAPI.getDashboardData({ year });
          const freshData = dashRes?.payload?.data;

          if (freshData) {
            set({
              data: freshData,
              timestamp: Date.now(),
              error: null,
            });
            console.log("✅ Silent revalidation complete - cache updated");
          }
        } catch (err) {
          console.error("⚠️ Silent revalidation failed:", err);
          // Don't update error state during background revalidation
          // User already has cached data
        }
      }, 0);

      return cachedData;
    }

    // No cache or forced refresh - fetch with loader
    console.log(
      force
        ? "🔄 Forced refresh - fetching fresh data"
        : "📥 No cache - fetching dashboard data",
    );

    set({ isLoading: true, error: null });

    try {
      const dashRes = await UserAPI.getDashboardData({ year });
      const dashData = dashRes?.payload?.data;

      if (dashData) {
        set({
          data: dashData,
          timestamp: Date.now(),
          isLoading: false,
          error: null,
        });
        console.log("✅ Dashboard data fetched and cached");
        return dashData;
      } else {
        throw new Error("No data returned from API");
      }
    } catch (err) {
      console.error("❌ Dashboard fetch failed:", err);
      set({
        isLoading: false,
        error: err.message || "Failed to fetch dashboard data",
      });
      return null;
    }
  },

  /**
   * Clear cache - forces fresh fetch on next access
   */
  invalidateCache: () => {
    console.log("🗑️ Dashboard cache invalidated");
    set({
      data: null,
      timestamp: null,
      error: null,
    });
  },
}));

export default useDashboardStore;

export const fieryHoverSx = {
  position: "relative",
  borderRadius: "12px",
  transition: "box-shadow 0.25s ease, transform 0.2s ease",
  "&::before": {
    content: '""',
    position: "absolute",
    inset: "-3px",
    borderRadius: "14px",
    background:
      "conic-gradient(from 0deg, rgba(255,138,0,0.0), rgba(255,61,0,0.55), rgba(255,180,0,0.35), rgba(255,61,0,0.55), rgba(255,138,0,0.0))",
    filter: "blur(10px)",
    opacity: 0,
    transition: "opacity 0.25s ease",
    zIndex: 0,
    pointerEvents: "none",
    animation: "none",
  },
  "&:hover": {
    boxShadow: "0 6px 16px rgba(255,80,0,0.45), 0 0 24px rgba(255,160,0,0.35)",
    transform: "translateY(-1px)",
  },
  "&:hover::before": {
    opacity: 1,
    animation: "flame 1.4s linear infinite",
  },
  "@keyframes flame": {
    "0%": { filter: "blur(8px) hue-rotate(0deg)" },
    "50%": { filter: "blur(10px) hue-rotate(20deg)" },
    "100%": { filter: "blur(8px) hue-rotate(0deg)" },
  },
  "& > *": { position: "relative", zIndex: 1 },
};

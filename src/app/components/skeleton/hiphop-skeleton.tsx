"use client"

export function HiphopSkeletonNotice() {
  return (
    <div className="fixed top-4 right-4 z-50 flex items-start gap-3 select-none">
      <div className="rounded-xl bg-black text-white text-xs leading-5 px-3 py-2 shadow-md max-w-[220px]">
        yo, the coins daily streak reward is completed, work on the day 07 on the popup for the 5 coins overlap position
      </div>
      <div className="relative w-[120px] h-[160px]">
        <svg viewBox="0 0 60 80" width="120" height="160" className="animate-break-bend">
          {/* Body center */}
          <g transform="translate(30,20)">
            {/* Head */}
            <circle cx="0" cy="-10" r="6" fill="none" stroke="#111" strokeWidth="2" />
            {/* Torso */}
            <line x1="0" y1="-4" x2="0" y2="20" stroke="#111" strokeWidth="2" />

            {/* Left arm group */}
            <g className="animate-break-arm-left" style={{ transformOrigin: "0px 2px" }}>
              <line x1="0" y1="2" x2="-14" y2="8" stroke="#111" strokeWidth="2" />
              <line x1="-14" y1="8" x2="-20" y2="0" stroke="#111" strokeWidth="2" />
            </g>

            {/* Right arm group */}
            <g className="animate-break-arm-right" style={{ transformOrigin: "0px 2px" }}>
              <line x1="0" y1="2" x2="14" y2="8" stroke="#111" strokeWidth="2" />
              <line x1="14" y1="8" x2="20" y2="0" stroke="#111" strokeWidth="2" />
            </g>

            {/* Hips */}
            <line x1="-8" y1="20" x2="8" y2="20" stroke="#111" strokeWidth="2" />

            {/* Left leg */}
            <g className="animate-break-leg-left" style={{ transformOrigin: "-8px 20px" }}>
              <line x1="-8" y1="20" x2="-12" y2="36" stroke="#111" strokeWidth="2" />
              <line x1="-12" y1="36" x2="-10" y2="50" stroke="#111" strokeWidth="2" />
            </g>

            {/* Right leg */}
            <g className="animate-break-leg-right" style={{ transformOrigin: "8px 20px" }}>
              <line x1="8" y1="20" x2="12" y2="36" stroke="#111" strokeWidth="2" />
              <line x1="12" y1="36" x2="10" y2="50" stroke="#111" strokeWidth="2" />
            </g>
          </g>
        </svg>
      </div>
    </div>
  )
}



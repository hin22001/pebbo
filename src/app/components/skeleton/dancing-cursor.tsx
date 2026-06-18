"use client"

import { useEffect, useRef, useState } from "react"

export function DancingCursor() {
  const [pos, setPos] = useState({ x: -9999, y: -9999 })
  const rafRef = useRef<number | null>(null)
  const nextRef = useRef<{ x: number; y: number } | null>(null)

  useEffect(() => {
    function onMove(e: MouseEvent) {
      nextRef.current = { x: e.clientX, y: e.clientY }
      if (rafRef.current) return
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null
        if (nextRef.current) setPos(nextRef.current)
      })
    }
    document.addEventListener("mousemove", onMove)
    const prevCursor = document.body.style.cursor
    document.body.style.cursor = "none"
    return () => {
      document.removeEventListener("mousemove", onMove)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      document.body.style.cursor = prevCursor
    }
  }, [])

  // Hide on touch / coarse pointers via CSS; still safe if shown
  return (
    <div
      className="fixed z-[100] pointer-events-none select-none [@media(pointer:coarse)]:hidden"
      style={{ left: 0, top: 0, transform: `translate(${pos.x}px, ${pos.y}px)` }}
    >
      {/* Offset to align "tip" */}
      <div style={{ transform: "translate(-10px, -18px)" }}>
        <svg viewBox="0 0 60 80" width="32" height="44" className="animate-break-bend">
          <g transform="translate(30,20)">
            <circle cx="0" cy="-10" r="6" fill="none" stroke="#111" strokeWidth="2" />
            <line x1="0" y1="-4" x2="0" y2="20" stroke="#111" strokeWidth="2" />
            <g className="animate-break-arm-left" style={{ transformOrigin: "0px 2px" }}>
              <line x1="0" y1="2" x2="-14" y2="8" stroke="#111" strokeWidth="2" />
              <line x1="-14" y1="8" x2="-20" y2="0" stroke="#111" strokeWidth="2" />
            </g>
            <g className="animate-break-arm-right" style={{ transformOrigin: "0px 2px" }}>
              <line x1="0" y1="2" x2="14" y2="8" stroke="#111" strokeWidth="2" />
              <line x1="14" y1="8" x2="20" y2="0" stroke="#111" strokeWidth="2" />
            </g>
            <line x1="-8" y1="20" x2="8" y2="20" stroke="#111" strokeWidth="2" />
            <g className="animate-break-leg-left" style={{ transformOrigin: "-8px 20px" }}>
              <line x1="-8" y1="20" x2="-12" y2="36" stroke="#111" strokeWidth="2" />
              <line x1="-12" y1="36" x2="-10" y2="50" stroke="#111" strokeWidth="2" />
            </g>
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



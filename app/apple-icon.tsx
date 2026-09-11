import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Mesma arte do icon.svg, rasterizada para o iOS (que não aceita SVG). */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%" }}>
        <svg width="180" height="180" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="cr-bg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#e8843f" />
              <stop offset=".55" stopColor="#c65a1e" />
              <stop offset="1" stopColor="#7a3b12" />
            </linearGradient>
          </defs>
          <rect width="512" height="512" rx="116" fill="url(#cr-bg)" />
          <g fill="none" stroke="#f7f0e2" strokeWidth="15" strokeLinecap="round">
            <path d="M202 216c-18-20 18-34 0-54c-18-20 18-34 0-42" opacity=".62" />
            <path d="M252 214c-22-24 22-42 0-66c-22-24 22-42 0-58" opacity=".95" />
            <path d="M302 216c-18-20 18-34 0-54c-18-20 18-34 0-38" opacity=".62" />
          </g>
          <path d="M346 276c46 0 46 64-4 64" fill="none" stroke="#f7f0e2" strokeWidth="21" strokeLinecap="round" />
          <path d="M160 252L176 350Q184 386 252 386Q320 386 328 350L344 252Z" fill="#f7f0e2" />
          <ellipse cx="252" cy="252" rx="92" ry="16" fill="#f7f0e2" />
          <ellipse cx="252" cy="250" rx="76" ry="11" fill="#6b3410" />
          <rect x="120" y="398" width="264" height="28" rx="14" fill="#f7f0e2" />
        </svg>
      </div>
    ),
    size
  );
}

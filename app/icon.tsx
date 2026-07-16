import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 8,
          background: "linear-gradient(135deg, #6366f1 0%, #d946ef 100%)",
        }}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 2L14.09 8.26L20 9.27L15.5 13.5L16.9 19.5L12 16.5L7.1 19.5L8.5 13.5L4 9.27L9.91 8.26L12 2Z"
            fill="white"
          />
        </svg>
      </div>
    ),
    { ...size },
  );
}

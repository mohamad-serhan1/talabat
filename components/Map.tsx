"use client";

interface MapProps {
  width: number;
  height: number;
  children?: React.ReactNode;
}

export default function Map({ width, height, children }: MapProps) {
  return (
    <div
      style={{
        width,
        height,
        position: "relative",
        backgroundColor: "#a3d9a5", // grass or map color
        overflow: "hidden",
        touchAction: "none",
        border: "2px solid #444", // optional border
      }}
    >
      {children}
    </div>
  );
}

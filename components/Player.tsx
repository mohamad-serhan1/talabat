import { useEffect, useState } from "react";

interface PlayerProps {
  mapWidth: number;
  mapHeight: number;
  onCollect: (id: number) => void;
  coins: { id: number, x: number, y: number }[];
}

export default function Player({ mapWidth, mapHeight, onCollect, coins }: PlayerProps) {
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const [health, setHealth] = useState(3);

  const moveStep = 8;

  // Desktop arrow keys
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      setPos(prev => {
        let x = prev.x, y = prev.y;
        if (e.key === "ArrowUp") y = Math.max(0, y - moveStep);
        if (e.key === "ArrowDown") y = Math.min(mapHeight - 40, y + moveStep);
        if (e.key === "ArrowLeft") x = Math.max(0, x - moveStep);
        if (e.key === "ArrowRight") x = Math.min(mapWidth - 40, x + moveStep);
        return { x, y };
      });
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [mapWidth, mapHeight]);

  // Mobile swipe
  useEffect(() => {
    let startX = 0, startY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    };
    const handleTouchMove = (e: TouchEvent) => {
      const dx = e.touches[0].clientX - startX;
      const dy = e.touches[0].clientY - startY;
      setPos(prev => {
        let x = prev.x + (dx > 20 ? moveStep : dx < -20 ? -moveStep : 0);
        let y = prev.y + (dy > 20 ? moveStep : dy < -20 ? -moveStep : 0);
        x = Math.max(0, Math.min(mapWidth - 40, x));
        y = Math.max(0, Math.min(mapHeight - 40, y));
        return { x, y };
      });
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    };
    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchmove", handleTouchMove);
    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, [mapWidth, mapHeight]);

  // Collect coins
  useEffect(() => {
    coins.forEach(c => {
      const dx = pos.x - c.x;
      const dy = pos.y - c.y;
      if (Math.abs(dx) < 40 && Math.abs(dy) < 40) {
        onCollect(c.id);
      }
    });
  }, [pos, coins, onCollect]);

  return (
    <div style={{
      position: "absolute",
      top: pos.y,
      left: pos.x,
      width: 40,
      height: 40,
      borderRadius: 8,
      backgroundColor: "red",
      transition: "top 0.1s, left 0.1s"
    }} />
  );
}

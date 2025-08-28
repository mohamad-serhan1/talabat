import { useEffect, useState } from "react";
import { isColliding } from "@/utils/collision";

interface EnemyProps {
  mapWidth: number;
  mapHeight: number;
  playerPos: {x:number,y:number};
  onHit: () => void;
}

export default function Enemy({ mapWidth, mapHeight, playerPos, onHit }: EnemyProps) {
  const [pos, setPos] = useState({ x: 200, y: 200 });

  useEffect(() => {
    const interval = setInterval(() => {
      // simple random movement
      setPos(prev => {
        let x = prev.x + (Math.random() > 0.5 ? 8 : -8);
        let y = prev.y + (Math.random() > 0.5 ? 8 : -8);
        x = Math.max(0, Math.min(mapWidth - 40, x));
        y = Math.max(0, Math.min(mapHeight - 40, y));

        if (isColliding({ x, y, w: 40, h: 40 }, { x: playerPos.x, y: playerPos.y, w: 40, h: 40 })) {
          onHit();
        }

        return { x, y };
      });
    }, 500);

    return () => clearInterval(interval);
  }, [mapWidth, mapHeight, playerPos, onHit]);

  return (
    <div style={{
      position: "absolute",
      top: pos.y,
      left: pos.x,
      width: 40,
      height: 40,
      borderRadius: 8,
      backgroundColor: "purple",
      transition: "top 0.4s, left 0.4s"
    }} />
  );
}

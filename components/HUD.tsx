interface HUDProps {
  health: number;
  score: number;
}

export default function HUD({ health, score }: HUDProps) {
  return (
    <div style={{ position: "absolute", top: 10, left: 10, color: "#fff", fontSize: 18 }}>
      <div>❤️ Health: {health}</div>
      <div>💰 Coins: {score}</div>
    </div>
  );
}

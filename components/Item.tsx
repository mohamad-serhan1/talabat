interface ItemProps {
  x: number;
  y: number;
}

export default function Item({ x, y }: ItemProps) {
  return (
    <div style={{
      position: "absolute",
      top: y,
      left: x,
      width: 30,
      height: 30,
      borderRadius: 50,
      backgroundColor: "gold"
    }} />
  );
}

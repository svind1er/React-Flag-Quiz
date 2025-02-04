"use client";
import { useEffect, useState } from "react";

export default function RoomBackground() {
  const [gradient, setGradient] = useState("linear-gradient(135deg, #222, #444)");

  useEffect(() => {
    let hue = 0;
    const interval = setInterval(() => {
      hue = (hue + 1) % 360;
      setGradient(`linear-gradient(135deg, hsl(${hue}, 50%, 20%), hsl(${(hue + 60) % 360}, 50%, 10%))`);
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return <div className="room-background" style={{ background: gradient }} />;
}

import { useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export function RouteCurtain() {
  const loc = useLocation();
  const [key, setKey] = useState(loc.pathname);
  useEffect(() => setKey(loc.pathname), [loc.pathname]);
  return (
    <div
      key={key}
      className="pointer-events-none fixed inset-0 z-[90] origin-bottom bg-obsidian"
      style={{ animation: "curtain-up 1.1s cubic-bezier(.7,0,.3,1) forwards" }}
    />
  );
}
import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { PotatoStage } from "@/components/PotatoStage";

export const Route = createFileRoute("/play")({
  head: () => ({
    meta: [
      { title: "Play — Poke the Potato" },
      {
        name: "description",
        content: "Poke the hanging potato. Watch it lose its patience. That is the whole game.",
      },
    ],
  }),
  component: Play,
});

function Play() {
  useEffect(() => {
    document.documentElement.classList.add("game-mode");
    return () => document.documentElement.classList.remove("game-mode");
  }, []);

  return (
    <main className="h-dvh w-full overflow-hidden bg-[#140e0b]">
      <PotatoStage />
    </main>
  );
}

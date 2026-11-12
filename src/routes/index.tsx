import { createFileRoute } from "@tanstack/react-router";
import { PotatoStage } from "@/components/PotatoStage";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return (
    <main className="h-dvh w-full overflow-hidden bg-[#140e0b]">
      <PotatoStage />
    </main>
  );
}

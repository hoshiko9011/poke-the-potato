import { Link } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  Flame,
  Github,
  Gauge,
  MessageCircle,
  MousePointerClick,
  Smartphone,
  Sparkles,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Poke the Potato — a tiny, slightly grumpy canvas toy" },
      {
        name: "description",
        content:
          "A small browser game about a hanging potato with feelings. Four hand-drawn art styles, five moods, one very patient little potato.",
      },
    ],
  }),
  component: Landing,
});

const STYLES = [
  {
    name: "Soft",
    blurb: "Warm, buttery, gently shaded. The default potato.",
    image: "/screenshots/styles-soft.png",
    dot: "bg-[#c99a5b]",
  },
  {
    name: "Pixel",
    blurb: "Chunky blocks and quiet nostalgia.",
    image: "/screenshots/style-pixel.png",
    dot: "bg-[#7fae6a]",
  },
  {
    name: "Sticker",
    blurb: "Thick outlines, zero regrets.",
    image: "/screenshots/style-sticker.png",
    dot: "bg-[#f2c27a]",
  },
  {
    name: "Ink",
    blurb: "Wobbly lines on warm paper.",
    image: "/screenshots/style-ink.png",
    dot: "bg-[#e8ddc6]",
  },
] as const;

const DETAILS = [
  {
    icon: Gauge,
    title: "A patience meter",
    body: "Five segments, five moods. Poke too often and the meter drops from Calm to Meltdown.",
  },
  {
    icon: MessageCircle,
    title: "Opinionated bubbles",
    body: "Every poke earns a reaction — from a polite “eep!” to an honest “I’m a potato!”.",
  },
  {
    icon: Flame,
    title: "Steam, eventually",
    body: "Keep going and the potato starts steaming, swaying, and looking personally offended.",
  },
  {
    icon: Sparkles,
    title: "A tiny companion",
    body: "The little potato watches your cursor and leaves a faint trail of sparkles behind it.",
  },
  {
    icon: MousePointerClick,
    title: "Zero loading",
    body: "Everything is drawn frame by frame on one canvas. No sprite sheets, no images, no spinners.",
  },
  {
    icon: Smartphone,
    title: "Phone-friendly",
    body: "44px touch targets, safe-area insets, haptics on poke, and a particle cap for smooth frames.",
  },
] as const;

const STEPS = [
  {
    title: "Move the little one",
    body: "Glide the cursor or drag your finger. The small potato follows, eyes locked on you.",
  },
  {
    title: "Get close, then poke",
    body: "Click or tap near the hanging potato. It reacts — particles, flash, bubble, buzz.",
  },
  {
    title: "Test its patience",
    body: "Poke again within 1.8 seconds to build a streak. The meter only refills once you leave it alone.",
  },
] as const;

function PotatoMark({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-grid size-9 place-items-center rounded-[45%_55%_50%_50%] bg-[#c99a5b] shadow-inner ${className}`}
    >
      <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
        <path d="M12 3c1.6-2 4.4-1.4 5 1" fill="none" stroke="#5f8f3e" strokeWidth="1.8" strokeLinecap="round" />
        <ellipse cx="12" cy="14" rx="7.5" ry="7" fill="#f3d7a3" />
        <circle cx="9.4" cy="13" r="1.1" fill="#3a2414" />
        <circle cx="14.6" cy="13" r="1.1" fill="#3a2414" />
        <path d="M10 16.4c1.2 1 2.8 1 4 0" fill="none" stroke="#3a2414" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    </span>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-[#2b1e12]/10 bg-[#f7efdd]/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-4 px-5">
        <Link to="/" className="flex items-center gap-2.5 text-[#2b1e12]">
          <PotatoMark />
          <span className="text-[15px] font-semibold tracking-tight">Poke the Potato</span>
        </Link>
        <nav className="ml-auto hidden items-center gap-7 text-sm text-[#6f5a44] md:flex">
          <a href="#styles" className="transition-colors hover:text-[#2b1e12]">
            Styles
          </a>
          <a href="#details" className="transition-colors hover:text-[#2b1e12]">
            Game details
          </a>
          <a href="#how" className="transition-colors hover:text-[#2b1e12]">
            How to play
          </a>
        </nav>
        <div className="ml-auto flex items-center gap-3 md:ml-0">
          <a
            href="https://github.com/hoshiko9011/poke-the-potato"
            target="_blank"
            rel="noreferrer"
            aria-label="View the source on GitHub"
            className="grid size-9 place-items-center rounded-full border border-[#2b1e12]/15 text-[#6f5a44] transition-colors hover:border-[#2b1e12]/30 hover:text-[#2b1e12]"
          >
            <Github className="size-4" />
          </a>
          <Link
            to="/play"
            className="rounded-full bg-[#2b1e12] px-4 py-2 text-sm font-medium text-[#f7efdd] transition-transform hover:-translate-y-0.5"
          >
            Play now
          </Link>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 right-[-10%] size-[34rem] rounded-full bg-[#e9d9b7]/70 blur-3xl"
      />
      <div className="relative mx-auto grid w-full max-w-6xl gap-14 px-5 pt-14 pb-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16 lg:pt-20 lg:pb-24">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-[#2b1e12]/15 bg-[#fffaf0] px-3 py-1.5 text-xs font-medium tracking-wide text-[#6f5a44] uppercase">
            <span className="size-1.5 rounded-full bg-[#6f9a3f]" />
            Tiny browser toy · no install
          </span>
          <h1 className="mt-6 font-serif text-5xl leading-[1.02] tracking-tight text-[#2b1e12] sm:text-6xl">
            A very small game about a very grumpy potato.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-[#6f5a44]">
            Swing the little potato toward the big hanging one. Poke it. Wait for the eyebrows. Repeat
            until the patience meter says <em className="text-[#2b1e12]">Meltdown</em>.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link
              to="/play"
              className="inline-flex items-center gap-2 rounded-full bg-[#2b1e12] px-6 py-3.5 text-sm font-semibold text-[#f7efdd] shadow-sm transition-transform hover:-translate-y-0.5"
            >
              Play the game
              <ArrowRight className="size-4" />
            </Link>
            <a
              href="#styles"
              className="inline-flex items-center gap-2 rounded-full border border-[#2b1e12]/20 px-6 py-3.5 text-sm font-semibold text-[#2b1e12] transition-colors hover:border-[#2b1e12]/40 hover:bg-[#fffaf0]"
            >
              See the four moods
            </a>
          </div>
          <dl className="mt-10 grid max-w-md grid-cols-3 gap-6 border-t border-[#2b1e12]/10 pt-6">
            {[
              ["4", "hand-drawn styles"],
              ["5", "moods to survive"],
              ["0", "loading screens"],
            ].map(([value, label]) => (
              <div key={label}>
                <dt className="font-serif text-3xl text-[#2b1e12]">{value}</dt>
                <dd className="mt-1 text-xs tracking-wide text-[#6f5a44] uppercase">{label}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative mx-auto w-full max-w-lg">
          <div
            aria-hidden="true"
            className="absolute -top-10 left-1/2 h-12 w-px -translate-x-1/2 bg-[#6b5344]/50"
          />
          <div className="rotate-1 rounded-[2rem] border-[7px] border-[#fffaf0] bg-[#140e0b] shadow-[0_30px_60px_-25px_rgba(43,30,18,0.55)]">
            <img
              src="/screenshots/hero-soft.png"
              alt="The soft potato hanging from a string while the little potato watches"
              className="w-full rounded-[1.5rem]"
              width={1280}
              height={800}
            />
          </div>
          <div className="absolute -bottom-5 -left-3 -rotate-2 rounded-2xl border border-[#2b1e12]/10 bg-[#fffaf0] px-4 py-3 shadow-md sm:-left-6">
            <p className="text-xs font-semibold text-[#2b1e12]">Everything is canvas</p>
            <p className="mt-0.5 text-[11px] text-[#6f5a44]">drawn every frame, no sprites</p>
          </div>
          <div className="absolute -top-3 -right-2 rotate-2 rounded-full bg-[#2b1e12] px-4 py-2 text-xs font-semibold text-[#f7efdd] shadow-md sm:-right-4">
            Eyebrows included
          </div>
        </div>
      </div>
    </section>
  );
}

function StyleSection() {
  return (
    <section id="styles" className="scroll-mt-20 border-y border-[#2b1e12]/10 bg-[#fffaf0]">
      <div className="mx-auto w-full max-w-6xl px-5 py-16 lg:py-20">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-xl">
            <p className="text-xs font-semibold tracking-[0.18em] text-[#8a5a2b] uppercase">Four moods</p>
            <h2 className="mt-3 font-serif text-4xl tracking-tight text-[#2b1e12]">
              One potato, four handwritten souls.
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-[#6f5a44]">
              Switch styles mid-poke. Each one has its own sprout, shading, eyes, and opinions.
            </p>
          </div>
          <Link
            to="/play"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#2b1e12] underline decoration-[#c99a5b] decoration-2 underline-offset-4"
          >
            Try them all
            <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STYLES.map((style) => (
            <article
              key={style.name}
              className="group overflow-hidden rounded-3xl border border-[#2b1e12]/10 bg-[#f7efdd] transition-transform hover:-translate-y-1"
            >
              <div className="aspect-[4/3] overflow-hidden bg-[#140e0b]">
                <img
                  src={style.image}
                  alt={`${style.name} style potato`}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  width={1280}
                  height={800}
                />
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2">
                  <span className={`size-2 rounded-full ${style.dot}`} />
                  <h3 className="font-serif text-xl text-[#2b1e12]">{style.name}</h3>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-[#6f5a44]">{style.blurb}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function DetailsSection() {
  return (
    <section id="details" className="scroll-mt-20">
      <div className="mx-auto w-full max-w-6xl px-5 py-16 lg:py-20">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold tracking-[0.18em] text-[#8a5a2b] uppercase">Game details</p>
          <h2 className="mt-3 font-serif text-4xl tracking-tight text-[#2b1e12]">
            Small game, unreasonable amount of care.
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-[#6f5a44]">
            Nothing here is random decoration. Every speck of dust, every wobbly outline, and every
            angry eyebrow is part of the reaction system.
          </p>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {DETAILS.map(({ icon: Icon, title, body }) => (
            <article
              key={title}
              className="rounded-3xl border border-[#2b1e12]/10 bg-[#fffaf0] p-6 transition-colors hover:border-[#2b1e12]/25"
            >
              <span className="inline-grid size-10 place-items-center rounded-2xl bg-[#efe0c0] text-[#5a3c22]">
                <Icon className="size-5" />
              </span>
              <h3 className="mt-4 text-[15px] font-semibold text-[#2b1e12]">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#6f5a44]">{body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowSection() {
  return (
    <section id="how" className="scroll-mt-20 border-y border-[#2b1e12]/10 bg-[#2b1e12] text-[#f7efdd]">
      <div className="mx-auto grid w-full max-w-6xl gap-12 px-5 py-16 lg:grid-cols-[0.85fr_1.15fr] lg:py-20">
        <div>
          <p className="text-xs font-semibold tracking-[0.18em] text-[#d9b784] uppercase">How to play</p>
          <h2 className="mt-3 font-serif text-4xl tracking-tight">Three moves. Infinite regret.</h2>
          <p className="mt-4 text-[15px] leading-relaxed text-[#d8c6ac]">
            Works with a mouse or a thumb. The potato is not going anywhere — that is sort of the
            problem.
          </p>
          <Link
            to="/play"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#f7efdd] px-6 py-3.5 text-sm font-semibold text-[#2b1e12] transition-transform hover:-translate-y-0.5"
          >
            Start poking
            <ArrowRight className="size-4" />
          </Link>
        </div>
        <ol className="space-y-4">
          {STEPS.map((step, index) => (
            <li
              key={step.title}
              className="flex gap-5 rounded-3xl border border-[#f7efdd]/15 bg-[#f7efdd]/5 p-6"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-full border border-[#d9b784]/40 font-serif text-lg text-[#d9b784]">
                {index + 1}
              </span>
              <div>
                <h3 className="text-[15px] font-semibold">{step.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-[#d8c6ac]">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function MobileSection() {
  return (
    <section className="mx-auto w-full max-w-6xl px-5 py-16 lg:py-20">
      <div className="grid items-center gap-12 rounded-[2.5rem] border border-[#2b1e12]/10 bg-[#fffaf0] p-6 sm:p-10 lg:grid-cols-2 lg:p-14">
        <div>
          <p className="text-xs font-semibold tracking-[0.18em] text-[#8a5a2b] uppercase">
            Made for thumbs
          </p>
          <h2 className="mt-3 font-serif text-4xl tracking-tight text-[#2b1e12]">
            Tuned on a phone, not a marketing deck.
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-[#6f5a44]">
            Sharp canvas up to 3× device pixel ratio, safe-area padding for notches and home bars, a
            short vibration on every poke, and a particle budget that keeps mid-range phones happy.
          </p>
          <ul className="mt-6 grid gap-3 text-sm text-[#2b1e12] sm:grid-cols-2">
            {[
              "Crisp on high-DPI screens",
              "Safe areas respected",
              "Haptic poke feedback",
              "Add to home screen",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2.5">
                <span className="size-1.5 rounded-full bg-[#6f9a3f]" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="relative mx-auto w-full max-w-[17rem]">
          <div className="rounded-[2.25rem] border-[7px] border-[#2b1e12] bg-[#140e0b] shadow-[0_30px_60px_-30px_rgba(43,30,18,0.6)]">
            <img
              src="/screenshots/styles-soft-mobile.png"
              alt="The potato game on a phone screen"
              className="w-full rounded-[1.75rem]"
              width={780}
              height={1688}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-[#2b1e12]/10 bg-[#f7efdd]">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-5 py-12 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link to="/" className="flex items-center gap-2.5 text-[#2b1e12]">
            <PotatoMark />
            <span className="text-[15px] font-semibold">Poke the Potato</span>
          </Link>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-[#6f5a44]">
            A tiny, slightly grumpy canvas toy. Made with warm brown pixels.
          </p>
        </div>
        <div className="flex gap-12 text-sm">
          <div className="space-y-2.5">
            <p className="text-xs font-semibold tracking-wide text-[#2b1e12] uppercase">Play</p>
            <Link to="/play" className="block text-[#6f5a44] hover:text-[#2b1e12]">
              The game
            </Link>
            <a href="#styles" className="block text-[#6f5a44] hover:text-[#2b1e12]">
              Art styles
            </a>
          </div>
          <div className="space-y-2.5">
            <p className="text-xs font-semibold tracking-wide text-[#2b1e12] uppercase">Elsewhere</p>
            <a
              href="https://github.com/hoshiko9011/poke-the-potato"
              target="_blank"
              rel="noreferrer"
              className="block text-[#6f5a44] hover:text-[#2b1e12]"
            >
              GitHub
            </a>
            <a
              href="https://github.com/hoshiko9011/poke-the-potato/blob/main/LICENSE"
              target="_blank"
              rel="noreferrer"
              className="block text-[#6f5a44] hover:text-[#2b1e12]"
            >
              MIT License
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-[#2b1e12]/10">
        <p className="mx-auto w-full max-w-6xl px-5 py-5 text-xs text-[#8a745c]">
          No potatoes were harmed; one was mildly inconvenienced.
        </p>
      </div>
    </footer>
  );
}

function Landing() {
  return (
    <div className="min-h-dvh bg-[#f7efdd]">
      <Header />
      <main>
        <Hero />
        <StyleSection />
        <DetailsSection />
        <HowSection />
        <MobileSection />
      </main>
      <Footer />
    </div>
  );
}

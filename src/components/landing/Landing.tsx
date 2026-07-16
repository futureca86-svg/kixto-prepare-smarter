import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Menu,
  X,
  ArrowRight,
  Play,
  Sparkles,
  Brain,
  Target,
  Layers,
  TrendingUp,
  Clock,
  Flame,
  FileText,
  Shield,
  CalendarCheck2,
  Zap,
  BarChart3,
  Download,
  Check,
  ChevronDown,
  Mail,
  Instagram,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import logo from "@/assets/kixto-logo.png.asset.json";

const NAV = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how" },
  { label: "Roadmap", href: "#roadmap" },
  { label: "Founder", href: "#founder" },
  { label: "FAQ", href: "#faq" },
];

function Logo({ className = "" }: { className?: string }) {
  return (
    <a href="#top" className={`flex items-center gap-2.5 ${className}`}>
      <img src={logo.url} alt="Kixto" className="h-9 w-9 rounded-full" />
      <span className="text-lg font-extrabold tracking-tight text-foreground">KIXTO</span>
    </a>
  );
}

function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-border/60 bg-white/70 backdrop-blur-xl"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:px-8">
        <Logo />
        <nav className="hidden items-center gap-8 md:flex">
          {NAV.map((n) => (
            <a
              key={n.href}
              href={n.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {n.label}
            </a>
          ))}
        </nav>
        <div className="hidden md:block">
          <Button className="brand-gradient-bg h-10 rounded-full px-5 text-sm font-semibold text-white shadow-none hover:opacity-90">
            Get Started <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
        <button
          className="rounded-full border border-border p-2 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <div className="border-t border-border bg-white/95 backdrop-blur-xl md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1 px-5 py-4">
            {NAV.map((n) => (
              <a
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
              >
                {n.label}
              </a>
            ))}
            <Button className="brand-gradient-bg mt-2 h-11 rounded-full text-sm font-semibold text-white hover:opacity-90">
              Get Started
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
}: {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  align?: "center" | "left";
}) {
  return (
    <div className={`${align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}`}>
      {eyebrow && (
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-white px-3 py-1 text-xs font-semibold text-muted-foreground"
        >
          <span className="brand-gradient-text">{eyebrow}</span>
        </motion.div>
      )}
      <motion.h2
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl"
      >
        {title}
      </motion.h2>
      {subtitle && (
        <motion.p
          variants={fadeUp}
          custom={1}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="mt-4 text-base text-muted-foreground sm:text-lg"
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
}

function DashboardMock() {
  return (
    <div className="relative isolate">
      {/* Ambient glow */}
      <div
        aria-hidden
        className="absolute -inset-16 -z-10 rounded-[48px] opacity-70 blur-3xl"
        style={{
          background:
            "radial-gradient(60% 60% at 30% 30%, rgba(37,99,235,0.25), transparent 60%), radial-gradient(50% 50% at 80% 70%, rgba(109,40,217,0.22), transparent 60%)",
        }}
      />
      {/* Laptop card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative rounded-[28px] border border-border bg-white p-3 shadow-[0_30px_80px_-30px_rgba(37,99,235,0.35)]"
      >
        <div className="rounded-[20px] bg-gradient-to-br from-slate-50 to-white p-5">
          {/* Window controls */}
          <div className="mb-4 flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
            <div className="ml-4 flex items-center gap-2 rounded-md bg-white px-2.5 py-1 text-[10px] text-muted-foreground shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> kixto.app / dashboard
            </div>
          </div>
          <div className="grid grid-cols-12 gap-3">
            {/* Sidebar */}
            <div className="col-span-3 space-y-2">
              <div className="flex items-center gap-2 rounded-lg bg-white px-2 py-2 shadow-sm">
                <img src={logo.url} alt="" className="h-5 w-5 rounded-full" />
                <div className="h-2 w-14 rounded bg-slate-200" />
              </div>
              {["Overview", "Papers", "Memory", "Planner"].map((l, i) => (
                <div
                  key={l}
                  className={`flex items-center gap-2 rounded-lg px-2 py-2 text-[10px] ${
                    i === 0 ? "brand-gradient-bg text-white" : "text-slate-500"
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
                  {l}
                </div>
              ))}
            </div>
            {/* Main */}
            <div className="col-span-9 space-y-3">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { l: "Streak", v: "42d", g: "from-blue-500 to-indigo-500" },
                  { l: "Papers", v: "128", g: "from-indigo-500 to-violet-500" },
                  { l: "Retention", v: "94%", g: "from-violet-500 to-fuchsia-500" },
                ].map((s) => (
                  <div key={s.l} className="rounded-xl border border-border bg-white p-3">
                    <div className="text-[9px] uppercase tracking-wide text-muted-foreground">
                      {s.l}
                    </div>
                    <div className={`mt-1 bg-gradient-to-r ${s.g} bg-clip-text text-xl font-bold text-transparent`}>
                      {s.v}
                    </div>
                  </div>
                ))}
              </div>
              {/* Chart */}
              <div className="rounded-xl border border-border bg-white p-3">
                <div className="mb-2 flex items-center justify-between">
                  <div className="h-2 w-20 rounded bg-slate-200" />
                  <div className="h-2 w-10 rounded bg-slate-100" />
                </div>
                <svg viewBox="0 0 300 90" className="h-24 w-full">
                  <defs>
                    <linearGradient id="lg" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#2563EB" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#6D28D9" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="ln" x1="0" x2="1">
                      <stop offset="0%" stopColor="#2563EB" />
                      <stop offset="100%" stopColor="#6D28D9" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0,70 C40,55 60,40 90,45 C120,50 140,20 180,25 C220,30 240,10 300,15 L300,90 L0,90 Z"
                    fill="url(#lg)"
                  />
                  <path
                    d="M0,70 C40,55 60,40 90,45 C120,50 140,20 180,25 C220,30 240,10 300,15"
                    fill="none"
                    stroke="url(#ln)"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-border bg-white p-3">
                  <div className="mb-2 h-2 w-16 rounded bg-slate-200" />
                  {[80, 60, 45].map((w, i) => (
                    <div key={i} className="mb-2 last:mb-0">
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                        <div className="brand-gradient-bg h-full rounded-full" style={{ width: `${w}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="rounded-xl border border-border bg-white p-3">
                  <div className="mb-2 h-2 w-14 rounded bg-slate-200" />
                  <div className="flex items-end gap-1.5">
                    {[40, 65, 30, 80, 55, 90, 70].map((h, i) => (
                      <div
                        key={i}
                        className="brand-gradient-bg w-3 rounded-t"
                        style={{ height: `${h * 0.6}px` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Floating phone */}
      <motion.div
        initial={{ opacity: 0, y: 40, rotate: -6 }}
        animate={{ opacity: 1, y: [0, -10, 0], rotate: -6 }}
        transition={{
          opacity: { duration: 0.8, delay: 0.3 },
          y: { duration: 6, repeat: Infinity, ease: "easeInOut" },
        }}
        className="absolute -bottom-10 -right-4 hidden w-40 rounded-[28px] border border-border bg-white p-2 shadow-[0_20px_60px_-20px_rgba(109,40,217,0.5)] sm:block md:-right-8 md:w-48"
      >
        <div className="rounded-[22px] bg-slate-50 p-3">
          <div className="mb-2 flex items-center justify-between">
            <img src={logo.url} alt="" className="h-5 w-5 rounded-full" />
            <div className="h-1.5 w-6 rounded-full bg-slate-200" />
          </div>
          <div className="brand-gradient-bg mb-2 rounded-xl p-2.5 text-white">
            <div className="text-[8px] opacity-80">Today</div>
            <div className="text-sm font-bold">Revision · 42m</div>
          </div>
          {["Advanced Accounts", "Corporate Law", "Taxation"].map((l, i) => (
            <div
              key={l}
              className="mb-1.5 flex items-center gap-2 rounded-lg bg-white p-1.5 text-[8px]"
            >
              <span
                className={`h-3 w-3 rounded-md ${
                  i === 0
                    ? "bg-blue-500"
                    : i === 1
                      ? "bg-indigo-500"
                      : "bg-violet-500"
                }`}
              />
              <span className="truncate text-slate-600">{l}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function Hero() {
  return (
    <section id="top" className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28">
      {/* Background decorations */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(60% 40% at 10% 0%, rgba(37,99,235,0.08), transparent 60%), radial-gradient(50% 40% at 100% 10%, rgba(109,40,217,0.08), transparent 60%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.35]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(15,23,42,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(15,23,42,0.05) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage:
            "radial-gradient(ellipse at 50% 0%, black 40%, transparent 75%)",
        }}
      />
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-14 px-5 md:px-8 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-6">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-3 py-1.5 text-xs font-semibold text-foreground shadow-sm"
          >
            <span className="brand-gradient-bg h-1.5 w-1.5 rounded-full" />
            <span>Launching Soon</span>
            <Sparkles className="h-3.5 w-3.5 text-primary" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.05 }}
            className="mt-6 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-[68px] lg:leading-[1.05]"
          >
            A New Way to <br className="hidden sm:block" />
            <span className="brand-gradient-text">Prepare for CA.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="mt-6 max-w-xl text-base text-muted-foreground sm:text-lg"
          >
            Kixto is a modern preparation system built specifically for CA students. Every feature is designed from the ground up to simplify studying, revision, practice and consistency.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <Button className="brand-gradient-bg h-12 rounded-full px-6 text-sm font-semibold text-white shadow-[0_10px_30px_-10px_rgba(37,99,235,0.6)] hover:opacity-90">
              Get Started <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-12 rounded-full border-border bg-white px-6 text-sm font-semibold text-foreground hover:bg-muted"
            >
              <Play className="mr-1.5 h-4 w-4" /> Watch Demo
            </Button>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-10 flex items-center gap-6 text-xs text-muted-foreground"
          >
            <div className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-primary" /> Built for CA</div>
            <div className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-primary" /> Original features</div>
            <div className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-primary" /> Made by a CA student</div>
          </motion.div>
        </div>
        <div className="lg:col-span-6">
          <DashboardMock />
        </div>
      </div>
    </section>
  );
}

function Problem() {
  const without = ["Notes", "PDFs", "Planner", "Revision", "Different Apps", "Scattered workflow"];
  return (
    <section className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionHeading
          eyebrow="The Problem"
          title={<>Preparing for CA shouldn't <br className="hidden md:block" />feel complicated.</>}
          subtitle="Today, preparation lives across a dozen tools. Kixto brings it into one thoughtful, focused system."
        />
        <div className="mt-16 grid grid-cols-1 items-stretch gap-6 md:grid-cols-[1fr_auto_1fr] md:gap-8">
          {/* Without */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            className="rounded-3xl border border-border bg-white p-6 md:p-8"
          >
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
              <X className="h-3.5 w-3.5" /> Without Kixto
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {without.map((w) => (
                <div
                  key={w}
                  className="flex items-center gap-2 rounded-xl border border-dashed border-border bg-slate-50/60 px-3 py-3 text-sm text-slate-500"
                >
                  <span className="h-2 w-2 rounded-full bg-slate-300" />
                  {w}
                </div>
              ))}
            </div>
            <p className="mt-6 text-sm text-muted-foreground">
              Constant switching. Nothing connects. Progress is invisible.
            </p>
          </motion.div>

          {/* Arrow */}
          <div className="flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="brand-gradient-bg flex h-12 w-12 items-center justify-center rounded-full text-white shadow-lg md:h-14 md:w-14"
            >
              <ArrowRight className="h-5 w-5 md:h-6 md:w-6" />
            </motion.div>
          </div>

          {/* With */}
          <motion.div
            variants={fadeUp}
            custom={1}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            className="relative overflow-hidden rounded-3xl border border-border bg-white p-6 md:p-8"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-60"
              style={{
                background:
                  "radial-gradient(60% 60% at 100% 0%, rgba(109,40,217,0.10), transparent 60%), radial-gradient(60% 60% at 0% 100%, rgba(37,99,235,0.10), transparent 60%)",
              }}
            />
            <div className="relative">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-primary shadow-sm ring-1 ring-primary/20">
                <Check className="h-3.5 w-3.5" /> With Kixto
              </div>
              <div className="rounded-2xl border border-border bg-white/80 p-5 backdrop-blur">
                <div className="mb-3 flex items-center gap-2">
                  <img src={logo.url} alt="" className="h-8 w-8 rounded-full" />
                  <div>
                    <div className="text-sm font-bold">Kixto Workspace</div>
                    <div className="text-[11px] text-muted-foreground">One system. Every feature connected.</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { i: FileText, l: "Papers" },
                    { i: Shield, l: "Memory" },
                    { i: CalendarCheck2, l: "Planner" },
                    { i: Zap, l: "Focus" },
                    { i: BarChart3, l: "Analytics" },
                    { i: Download, l: "Library" },
                  ].map(({ i: Icon, l }) => (
                    <div
                      key={l}
                      className="flex flex-col items-center gap-1.5 rounded-xl border border-border bg-white p-3 text-center"
                    >
                      <Icon className="h-4 w-4 text-primary" />
                      <span className="text-[11px] font-medium text-slate-600">{l}</span>
                    </div>
                  ))}
                </div>
              </div>
              <p className="mt-6 text-sm text-muted-foreground">
                Everything organized inside one modern preparation system.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

const WHY = [
  { icon: Brain, title: "Never Forget Concepts", desc: "Retention-first design that fights the forgetting curve." },
  { icon: Target, title: "Practice Better", desc: "Focused practice sessions built around real CA question patterns." },
  { icon: Layers, title: "Stay Organized", desc: "Subjects, chapters and progress in one calm workspace." },
  { icon: TrendingUp, title: "Track Progress", desc: "See exactly where you stand — and what to fix next." },
  { icon: Clock, title: "Save Time", desc: "Less setup, more studying. Kixto removes the busywork." },
  { icon: Flame, title: "Stay Consistent", desc: "Streaks and gentle nudges that keep momentum every day." },
];

function Why() {
  return (
    <section id="why" className="relative bg-[color:oklch(0.985_0.005_258)] py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionHeading
          eyebrow="Why Kixto"
          title="Why Kixto Exists"
          subtitle="Six reasons Kixto is different from anything CA students have used before."
        />
        <div className="mt-16 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {WHY.map((w, i) => (
            <motion.div
              key={w.title}
              variants={fadeUp}
              custom={i}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-60px" }}
              className="group relative overflow-hidden rounded-3xl border border-border bg-white p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_-20px_rgba(37,99,235,0.25)]"
            >
              <div className="brand-gradient-bg mb-6 flex h-11 w-11 items-center justify-center rounded-2xl text-white">
                <w.icon className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-foreground">{w.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{w.desc}</p>
              <div
                aria-hidden
                className="pointer-events-none absolute -bottom-16 -right-16 h-40 w-40 rounded-full opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{
                  background: "radial-gradient(circle, rgba(109,40,217,0.15), transparent 70%)",
                }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

const FEATURES = [
  { icon: FileText, title: "Practice Papers", desc: "Curated practice sets aligned to the CA syllabus and question style.", soon: false },
  { icon: Shield, title: "Memory Guard", desc: "Active recall that protects long-term memory before exam day.", soon: false },
  { icon: CalendarCheck2, title: "Smart Planner", desc: "A planner that adapts to your subjects, pace and study rhythm.", soon: false },
  { icon: Zap, title: "Productivity", desc: "Focus sessions, distraction control and deep-work tracking.", soon: true },
  { icon: BarChart3, title: "Analytics", desc: "Beautiful, actionable insights across every subject and topic.", soon: false },
  { icon: Download, title: "Downloads", desc: "Offline library of your notes, papers and revision material.", soon: true },
];

function Features() {
  return (
    <section id="features" className="py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionHeading
          eyebrow="Explore Kixto"
          title={<>Original Features Built <br className="hidden md:block" />for CA Students</>}
          subtitle="Every module inside Kixto is designed from scratch — not repackaged from existing tools."
        />
        <div className="mt-16 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              variants={fadeUp}
              custom={i}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-60px" }}
              className="relative overflow-hidden rounded-3xl border border-border bg-white p-7 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-gradient-to-br from-blue-50 to-violet-50">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                {f.soon && (
                  <span className="rounded-full border border-border bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Coming Soon
                  </span>
                )}
              </div>
              <h3 className="mt-6 text-lg font-bold text-foreground">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

const STEPS = [
  { t: "Create Account", d: "Sign up in seconds — no clutter, no forms." },
  { t: "Choose CA Level", d: "Foundation, Intermediate or Final — Kixto adapts." },
  { t: "Select Subjects", d: "Pick your subjects; your workspace is ready." },
  { t: "Start Using Features", d: "Papers, planner and memory tools from day one." },
  { t: "Track Progress", d: "See real signals of how your preparation is moving." },
  { t: "Improve Daily", d: "Small, consistent gains that compound to exam day." },
];

function HowItWorks() {
  return (
    <section id="how" className="relative bg-[color:oklch(0.985_0.005_258)] py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionHeading
          eyebrow="How It Works"
          title="From setup to exam day"
          subtitle="Kixto guides you through a simple, focused preparation journey."
        />
        <div className="relative mx-auto mt-16 max-w-3xl">
          <div
            aria-hidden
            className="absolute left-6 top-3 bottom-3 w-px bg-gradient-to-b from-primary/40 via-secondary/40 to-transparent md:left-1/2"
          />
          <div className="space-y-6 md:space-y-10">
            {STEPS.map((s, i) => (
              <motion.div
                key={s.t}
                variants={fadeUp}
                custom={i}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-60px" }}
                className={`relative flex items-start gap-5 md:gap-8 ${
                  i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                } md:items-center`}
              >
                <div className="relative z-10 flex md:w-1/2 md:justify-end">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-4 border-[color:oklch(0.985_0.005_258)] brand-gradient-bg text-sm font-bold text-white md:absolute md:left-1/2 md:-translate-x-1/2">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                </div>
                <div
                  className={`flex-1 rounded-2xl border border-border bg-white p-5 md:w-1/2 md:p-6 ${
                    i % 2 === 0 ? "md:mr-auto md:ml-16" : "md:ml-auto md:mr-16"
                  }`}
                >
                  <div className="text-base font-bold text-foreground md:text-lg">{s.t}</div>
                  <div className="mt-1 text-sm text-muted-foreground">{s.d}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function DashboardPreview() {
  return (
    <section className="relative overflow-hidden py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionHeading
          eyebrow="Dashboard"
          title="Your entire preparation, beautifully in view"
          subtitle="A calm, focused workspace designed to feel effortless — on desktop and mobile."
        />
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="mt-16"
        >
          <DashboardMock />
        </motion.div>
      </div>
    </section>
  );
}

function Founder() {
  return (
    <section id="founder" className="relative bg-[color:oklch(0.985_0.005_258)] py-24 md:py-32">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-5 md:px-8 md:grid-cols-2 md:gap-16">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="relative"
        >
          <div className="relative mx-auto aspect-square w-full max-w-sm overflow-hidden rounded-[32px] border border-border bg-white p-3 shadow-[0_30px_80px_-30px_rgba(37,99,235,0.35)]">
            <div
              className="flex h-full w-full items-center justify-center rounded-[24px] text-6xl font-black text-white"
              style={{
                background:
                  "linear-gradient(135deg, #2563EB 0%, #6D28D9 60%, #DB2777 100%)",
              }}
            >
              CA
            </div>
            <div className="absolute -bottom-4 -right-4 rounded-2xl border border-border bg-white px-4 py-3 shadow-lg">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Founder</div>
              <div className="text-sm font-bold text-foreground">Kixto Team</div>
            </div>
          </div>
        </motion.div>
        <div>
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-3 py-1 text-xs font-semibold text-muted-foreground"
          >
            <span className="brand-gradient-text">Founder</span>
          </motion.div>
          <motion.h2
            variants={fadeUp}
            custom={1}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl"
          >
            Built by a CA Student
          </motion.h2>
          <motion.p
            variants={fadeUp}
            custom={2}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg"
          >
            Kixto started with one simple idea. CA students deserve a smarter and more organized preparation experience. Every feature is built from real preparation challenges instead of assumptions.
          </motion.p>
          <motion.blockquote
            variants={fadeUp}
            custom={3}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="mt-8 rounded-2xl border-l-4 border-primary bg-white p-5 text-sm italic text-foreground/80"
          >
            “I wanted the tool I wished I had while preparing — so I'm building it for the next generation of CA students.”
          </motion.blockquote>
        </div>
      </div>
    </section>
  );
}

const CURRENT = ["Practice Papers", "Memory Guard", "Planner", "Analytics", "Productivity"];
const NEXT = ["Community", "Mobile App", "Advanced Analytics", "Study Groups", "AI Assistant"];

function Roadmap() {
  return (
    <section id="roadmap" className="py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionHeading
          eyebrow="Roadmap"
          title="Where Kixto is today, and where it's going"
          subtitle="We ship deliberately — each release focused on real preparation impact."
        />
        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
          {[
            { title: "Current", items: CURRENT, tag: "Live", accent: "from-emerald-500 to-teal-500" },
            { title: "Coming Next", items: NEXT, tag: "Soon", accent: "from-blue-500 to-violet-500" },
          ].map((col, ci) => (
            <motion.div
              key={col.title}
              variants={fadeUp}
              custom={ci}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-60px" }}
              className="rounded-3xl border border-border bg-white p-6 md:p-8"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-foreground">{col.title}</h3>
                <span className={`rounded-full bg-gradient-to-r ${col.accent} px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white`}>
                  {col.tag}
                </span>
              </div>
              <div className="relative mt-6">
                <div aria-hidden className="absolute left-[11px] top-2 bottom-2 w-px bg-border" />
                <ul className="space-y-4">
                  {col.items.map((it) => (
                    <li key={it} className="flex items-start gap-4">
                      <span className="mt-1 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-white">
                        <span className={`h-2 w-2 rounded-full bg-gradient-to-r ${col.accent}`} />
                      </span>
                      <span className="text-sm font-medium text-foreground">{it}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

const FAQS = [
  { q: "What is Kixto?", a: "Kixto is a modern preparation system built specifically for CA students, combining practice, memory, planning and analytics in one focused workspace." },
  { q: "Who is it for?", a: "CA Foundation, Intermediate and Final students who want a calmer, smarter way to prepare — without juggling a dozen tools." },
  { q: "Is it free?", a: "Kixto launches with a generous free plan so any CA student can benefit from day one. Premium features will be introduced later." },
  { q: "Can I use it on mobile?", a: "Yes. Kixto is fully responsive on mobile browsers today, and a dedicated mobile app is on the roadmap." },
  { q: "How often is it updated?", a: "We ship frequent, meaningful updates — every improvement is shaped by real feedback from CA students." },
];

function FAQSection() {
  return (
    <section id="faq" className="bg-[color:oklch(0.985_0.005_258)] py-24 md:py-32">
      <div className="mx-auto max-w-3xl px-5 md:px-8">
        <SectionHeading
          eyebrow="FAQ"
          title="Questions, answered"
          subtitle="Everything you might want to know before getting started."
        />
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mt-12"
        >
          <Accordion type="single" collapsible className="space-y-3">
            {FAQS.map((f, i) => (
              <AccordionItem
                key={f.q}
                value={`item-${i}`}
                className="overflow-hidden rounded-2xl border border-border bg-white px-5 [&>h3]:border-b-0"
              >
                <AccordionTrigger className="py-5 text-left text-base font-semibold text-foreground hover:no-underline">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="pb-5 text-sm leading-relaxed text-muted-foreground">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="px-5 py-24 md:px-8 md:py-32">
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="relative mx-auto max-w-6xl overflow-hidden rounded-[32px] p-10 text-center md:p-20"
        style={{
          background:
            "linear-gradient(135deg, #1E3A8A 0%, #2563EB 40%, #6D28D9 100%)",
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.25), transparent 40%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.15), transparent 40%)",
          }}
        />
        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" /> Launching Soon
          </div>
          <h2 className="mx-auto mt-6 max-w-3xl text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl">
            Ready to prepare smarter?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-white/80 sm:text-lg">
            Join Kixto and experience a better way to prepare for CA.
          </p>
          <div className="mt-8 flex justify-center">
            <Button className="h-12 rounded-full bg-white px-7 text-sm font-semibold text-foreground hover:bg-white/90">
              Get Started <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border bg-white">
      <div className="mx-auto max-w-7xl px-5 py-12 md:px-8 md:py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              Prepare. Practice. Progress.
            </p>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Navigation</div>
            <ul className="mt-4 space-y-2 text-sm">
              {["Privacy", "Terms", "Contact"].map((l) => (
                <li key={l}>
                  <a href="#" className="text-foreground hover:text-primary">
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Connect</div>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <a href="#" className="inline-flex items-center gap-2 text-foreground hover:text-primary">
                  <Instagram className="h-4 w-4" /> Instagram
                </a>
              </li>
              <li>
                <a href="mailto:hello@kixto.app" className="inline-flex items-center gap-2 text-foreground hover:text-primary">
                  <Mail className="h-4 w-4" /> Email
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground md:flex-row md:items-center">
          <div>© {new Date().getFullYear()} Kixto. All rights reserved.</div>
          <div>Made for CA students.</div>
        </div>
      </div>
    </footer>
  );
}

export function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main>
        <Hero />
        <Problem />
        <Why />
        <Features />
        <HowItWorks />
        <DashboardPreview />
        <Founder />
        <Roadmap />
        <FAQSection />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span
      className={`font-black tracking-[0.18em] leading-none text-foreground ${className}`}
      aria-label="KIXTO"
    >
      KI<span className="brand-gradient-text">X</span>TO
    </span>
  );
}

export function Tagline({ className = "" }: { className?: string }) {
  return (
    <span
      className={`font-bold tracking-[0.22em] uppercase text-foreground ${className}`}
      aria-label="Prepare. Practice. Progress."
    >
      Prepare. <span className="text-foreground/90">Practice.</span>{" "}
      <span className="brand-gradient-text">Progress.</span>
    </span>
  );
}

export function LogoMark({
  className = "h-9 w-9",
}: {
  className?: string;
}) {
  return (
    <img
      src="/kixtologo.png"
      alt="Kixto logo"
      className={`${className} object-contain`}
    />
  );
}

export function BrandLock({ className = "" }: { className?: string }) {
  return (
    <span className={`flex items-center gap-2.5 ${className}`}>
      <LogoMark />
      <Wordmark className="text-lg" />
    </span>
  );
}

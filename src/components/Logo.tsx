import logo from "@/assets/diamante-logo.png";

export function Logo({ size = 36, className = "" }: { size?: number; className?: string }) {
  return (
    <span
      className={`relative grid place-items-center rounded-xl ${className}`}
      style={{ width: size, height: size }}
    >
      <span className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/40 to-accent/30 blur-[6px]" />
      <img
        src={logo}
        alt="Logo Diamante.dev"
        width={size}
        height={size}
        loading="eager"
        decoding="async"
        className="relative h-full w-full object-contain drop-shadow-[0_4px_14px_rgba(90,150,255,0.55)]"
      />
    </span>
  );
}

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`font-display font-bold tracking-tight text-white ${className}`}>
      Diamante<span className="text-accent">.dev</span>
    </span>
  );
}

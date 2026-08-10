export function ShaderBg() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div
        className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full opacity-20 blur-3xl animate-liquid"
        style={{
          background: "radial-gradient(circle, oklch(0.72 0.19 245 / 0.55), transparent 70%)",
        }}
      />
      <div
        className="absolute top-1/3 -right-40 h-[700px] w-[700px] rounded-full opacity-[0.18] blur-3xl animate-liquid"
        style={{
          background: "radial-gradient(circle, oklch(0.78 0.15 220 / 0.5), transparent 70%)",
          animationDelay: "-4s",
        }}
      />
      <div
        className="absolute -bottom-40 left-1/3 h-[600px] w-[600px] rounded-full opacity-[0.14] blur-3xl animate-liquid"
        style={{
          background: "radial-gradient(circle, oklch(0.6 0.18 270 / 0.5), transparent 70%)",
          animationDelay: "-8s",
        }}
      />
      <div
        className="absolute top-1/4 left-1/4 h-[520px] w-[520px] rounded-full opacity-[0.12] blur-3xl animate-aurora"
        style={{
          background:
            "conic-gradient(from 120deg, oklch(0.72 0.19 245 / 0.5), oklch(0.82 0.13 195 / 0.35), transparent 65%)",
        }}
      />
      <div
        className="absolute bottom-0 right-1/4 h-[420px] w-[420px] rounded-full opacity-[0.1] blur-3xl animate-aurora"
        style={{
          background:
            "conic-gradient(from 300deg, oklch(0.78 0.15 220 / 0.45), oklch(0.65 0.2 285 / 0.3), transparent 70%)",
          animationDelay: "-7s",
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: "radial-gradient(rgba(10,20,60,0.5) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
    </div>
  );
}

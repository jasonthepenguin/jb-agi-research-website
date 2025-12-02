import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-800 bg-black">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-xl font-bold tracking-tight text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]"
        >
          <span className="drop-shadow-[0_0_8px_rgba(59,130,246,0.7)] filter">🌀</span>
          JB Research
        </Link>
        <Link
          href="/about"
          className="text-sm font-medium text-zinc-400 transition-colors hover:text-white"
        >
          About
        </Link>
      </div>
    </nav>
  );
}

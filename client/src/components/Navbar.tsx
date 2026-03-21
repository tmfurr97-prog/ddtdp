import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Link, useLocation } from "wouter";

const LOGO_SVG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663452175762/3xUiue9tuXw8UZaZ8hqjt9/Title_944f7b9c.svg";

const NAV_LINKS = [
  { href: "/check", label: "Check", sub: "Fact Check" },
  { href: "/lab", label: "Deconstruct Lab", sub: "Hoax Archive" },
  { href: "/toolkit", label: "Verify", sub: "AI Tools" },
  { href: "/sober-up", label: "Sober Up", sub: "Community" },
  { href: "/train-up", label: "Train Up", sub: "Resources" },
  { href: "/premium", label: "Premium", sub: "Go Deep" },
];

export default function Navbar() {
  const { isAuthenticated, user } = useAuth();
  const [location] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const logout = trpc.auth.logout.useMutation({
    onSuccess: () => window.location.reload(),
  });

  return (
    <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur-sm">
      {/* Ticker Bar */}
      <div className="border-b border-border/30 bg-secondary/30 overflow-hidden h-7 flex items-center">
        <div className="ticker-track flex gap-16 whitespace-nowrap text-xs font-mono text-muted-foreground">
          {Array(2).fill(null).map((_, i) => (
            <span key={i} className="flex gap-16">
              <span>⚠ VERIFY BEFORE YOU SHARE</span>
              <span>// DON'T DRINK THE DIGITAL PUNCH</span>
              <span>⚠ QUESTION EVERYTHING</span>
              <span>// MISINFORMATION IS A WEAPON</span>
              <span>⚠ CHECK YOUR SOURCES</span>
              <span>// STAY SOBER ONLINE</span>
              <span>⚠ DEEPFAKES ARE REAL</span>
              <span>// CRITICAL THINKING SAVES LIVES</span>
            </span>
          ))}
        </div>
      </div>

      <div className="container">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 no-underline group">
            <img
              src={LOGO_SVG}
              alt="Don't Drink the Digital Punch"
              className="h-8 w-auto opacity-90 group-hover:opacity-100 transition-opacity"
            />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 text-xs font-mono tracking-wide transition-all rounded-sm no-underline group ${
                  location === link.href
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                }`}
              >
                <span className="block">{link.label}</span>
                <span className="block text-[10px] opacity-50">{link.sub}</span>
              </Link>
            ))}
          </div>

          {/* Auth + Donate */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/donate"
              className="px-3 py-1.5 text-xs font-mono tracking-widest uppercase text-accent border border-accent/30 hover:border-accent/60 hover:bg-accent/5 transition-all rounded-sm no-underline"
            >
              Support
            </Link>
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/profile"
                  className="px-3 py-1.5 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors no-underline"
                >
                  {user?.name?.split(" ")[0] ?? "Profile"}
                </Link>
                <button
                  onClick={() => logout.mutate()}
                  className="px-3 py-1.5 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <a
                href={getLoginUrl()}
                className="px-4 py-1.5 bg-primary text-primary-foreground text-xs font-mono tracking-widest uppercase hover:bg-primary/90 transition-all rounded-sm no-underline"
              >
                Sign In
              </a>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <div className="w-5 space-y-1">
              <span className={`block h-px bg-current transition-all ${menuOpen ? "rotate-45 translate-y-1.5" : ""}`} />
              <span className={`block h-px bg-current transition-all ${menuOpen ? "opacity-0" : ""}`} />
              <span className={`block h-px bg-current transition-all ${menuOpen ? "-rotate-45 -translate-y-1.5" : ""}`} />
            </div>
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-border/50 py-3 space-y-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2 text-sm font-mono text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-sm no-underline transition-colors"
              >
                <span>{link.label}</span>
                <span className="text-xs opacity-50">{link.sub}</span>
              </Link>
            ))}
            <div className="pt-2 border-t border-border/30 flex flex-col gap-1">
              <Link href="/donate" onClick={() => setMenuOpen(false)} className="px-3 py-2 text-sm font-mono text-accent no-underline">
                Support the Mission
              </Link>
              {isAuthenticated ? (
                <>
                  <Link href="/profile" onClick={() => setMenuOpen(false)} className="px-3 py-2 text-sm font-mono text-muted-foreground no-underline">
                    My Profile
                  </Link>
                  <button onClick={() => { logout.mutate(); setMenuOpen(false); }} className="px-3 py-2 text-sm font-mono text-muted-foreground text-left">
                    Sign Out
                  </button>
                </>
              ) : (
                <a href={getLoginUrl()} className="px-3 py-2 text-sm font-mono text-primary no-underline">
                  Sign In →
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

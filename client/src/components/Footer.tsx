import { Link } from "wouter";

const LOGO_SVG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663452175762/3xUiue9tuXw8UZaZ8hqjt9/Title_944f7b9c.svg";

export default function Footer() {
  return (
    <footer className="border-t border-border/50 bg-card/30 mt-auto">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <img src={LOGO_SVG} alt="Don't Drink the Digital Punch" className="h-10 w-auto mb-4 opacity-80" />
            <p className="text-sm font-mono text-muted-foreground leading-relaxed max-w-sm">
              A raw, confrontational platform for media literacy. We help you identify, deconstruct, and verify misinformation before it spreads.
            </p>
            <div className="mt-4 flex gap-3">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-mono text-muted-foreground hover:text-primary transition-colors no-underline"
              >
                Twitter/X
              </a>
              <span className="text-muted-foreground/30">|</span>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-mono text-muted-foreground hover:text-primary transition-colors no-underline"
              >
                Instagram
              </a>
              <span className="text-muted-foreground/30">|</span>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-mono text-muted-foreground hover:text-primary transition-colors no-underline"
              >
                YouTube
              </a>
            </div>
          </div>

          {/* Tools */}
          <div>
            <div className="text-xs font-mono tracking-widest uppercase text-muted-foreground mb-4">// Tools</div>
            <ul className="space-y-2">
              {[
                { href: "/toolkit", label: "Verification Toolkit" },
                { href: "/toolkit/email", label: "Email Scanner" },
                { href: "/toolkit/video", label: "Video Analyzer" },
                { href: "/lab", label: "Deconstruct Lab" },
                { href: "/train-up", label: "Train Up" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm font-mono text-muted-foreground hover:text-foreground transition-colors no-underline">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Community */}
          <div>
            <div className="text-xs font-mono tracking-widest uppercase text-muted-foreground mb-4">// Community</div>
            <ul className="space-y-2">
              {[
                { href: "/sober-up", label: "Sober Up Stories" },
                { href: "/premium", label: "Go Premium" },
                { href: "/partners", label: "Partner Badges" },
                { href: "/donate", label: "Support Mission" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm font-mono text-muted-foreground hover:text-foreground transition-colors no-underline">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-border/30 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs font-mono text-muted-foreground/50">
            © {new Date().getFullYear()} Don't Drink the Digital Punch. All rights reserved.
          </p>
          <div className="flex items-center gap-1">
            <span className="text-xs font-mono text-muted-foreground/50">Built for</span>
            <span className="text-xs font-mono text-primary/60 ml-1">truth-seekers</span>
            <span className="text-xs font-mono text-muted-foreground/50">, not</span>
            <span className="text-xs font-mono text-accent/60 ml-1">sheep</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

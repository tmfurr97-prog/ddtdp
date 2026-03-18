import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";

const LOGO_MP4 = "https://d2xsxph8kpxj0f.cloudfront.net/310519663452175762/3xUiue9tuXw8UZaZ8hqjt9/Title_f2c56a38.mp4";
const LOGO_SVG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663452175762/3xUiue9tuXw8UZaZ8hqjt9/Title_944f7b9c.svg";

const CONTENT_PILLARS = [
  {
    href: "/lab",
    tag: "Deconstruct Lab",
    tagline: "Tear it apart.",
    desc: "A living archive of debunked hoaxes, viral lies, and manipulated media. Every entry is broken down to its bones — where it came from, how it spread, why people believed it.",
    cta: "Enter the Lab →",
    accent: "text-accent",
    border: "border-accent/20 hover:border-accent/50",
  },
  {
    href: "/toolkit",
    tag: "Verify",
    tagline: "Check before you wreck.",
    desc: "AI-powered tools to analyze URLs, scan emails for phishing, detect deepfakes, and deconstruct manipulative text. Your personal misinformation detection kit.",
    cta: "Open Toolkit →",
    accent: "text-primary",
    border: "border-primary/20 hover:border-primary/50",
  },
  {
    href: "/sober-up",
    tag: "Sober Up",
    tagline: "You're not alone.",
    desc: "Real stories from people who got played by misinformation — and came out the other side. Submit your story. Help others recognize the signs.",
    cta: "Read Stories →",
    accent: "text-purple-400",
    border: "border-purple-400/20 hover:border-purple-400/50",
  },
  {
    href: "/train-up",
    tag: "Train Up",
    tagline: "Build your immunity.",
    desc: "Guides, frameworks, and deep-dives on manipulation tactics, logical fallacies, deepfake detection, and algorithmic influence. Knowledge is the antidote.",
    cta: "Start Training →",
    accent: "text-green-400",
    border: "border-green-400/20 hover:border-green-400/50",
  },
];

const STATS = [
  { value: "2.3B", label: "Pieces of misinformation shared daily" },
  { value: "70%", label: "Of people can't spot a deepfake" },
  { value: "6x", label: "Faster spread than true news" },
  { value: "92%", label: "Never check before sharing" },
];

export default function Home() {
  const { isAuthenticated } = useAuth();
  const { data: featuredHoaxes } = trpc.hoaxes.featured.useQuery();
  const { data: featuredTestimonials } = trpc.testimonials.featured.useQuery();

  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[85vh] flex flex-col items-center justify-center overflow-hidden border-b border-border/50">
        {/* Background grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "linear-gradient(oklch(0.85 0.22 195) 1px, transparent 1px), linear-gradient(90deg, oklch(0.85 0.22 195) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-32 h-32 border-l-2 border-t-2 border-primary/20" />
        <div className="absolute bottom-0 right-0 w-32 h-32 border-r-2 border-b-2 border-accent/20" />

        <div className="container relative z-10 text-center py-20">
          {/* Animated logo */}
          <div className="mb-8 flex justify-center">
            <video
              src={LOGO_MP4}
              autoPlay
              loop
              muted
              playsInline
              className="h-32 md:h-48 w-auto"
              poster={LOGO_SVG}
            />
          </div>

          <div className="text-xs font-mono tracking-widest uppercase text-primary mb-6">
            // Media Literacy Verification Hub
          </div>

          <h1 className="text-6xl md:text-8xl lg:text-9xl font-display tracking-widest text-foreground mb-4 leading-none">
            <span className="glitch" data-text="DON'T">DON'T</span>
            <br />
            <span className="glitch" data-text="DRINK THE">DRINK THE</span>
            <br />
            <span className="text-primary glitch" data-text="DIGITAL PUNCH">DIGITAL PUNCH</span>
          </h1>

          <p className="text-lg md:text-xl font-mono text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Misinformation is the most dangerous drink at the party.<br />
            <span className="text-foreground">We help you identify it, deconstruct it, and spit it out.</span>
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {!isAuthenticated ? (
              <a
                href={getLoginUrl()}
                className="px-8 py-3.5 bg-primary text-primary-foreground font-mono tracking-widest uppercase text-sm hover:bg-primary/90 transition-all rounded-sm no-underline pulse-cyan"
              >
                Join the Movement
              </a>
            ) : (
              <Link
                href="/toolkit"
                className="px-8 py-3.5 bg-primary text-primary-foreground font-mono tracking-widest uppercase text-sm hover:bg-primary/90 transition-all rounded-sm no-underline"
              >
                Verify Something Now
              </Link>
            )}
            <Link
              href="/lab"
              className="px-8 py-3.5 border border-border text-muted-foreground font-mono tracking-widest uppercase text-sm hover:border-primary/50 hover:text-foreground transition-all rounded-sm no-underline"
            >
              See the Evidence
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats Ticker ─────────────────────────────────────────────────────── */}
      <section className="border-b border-border/50 bg-secondary/20 py-6">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map((stat) => (
              <div key={stat.value} className="text-center">
                <div className="text-3xl md:text-4xl font-display text-primary mb-1">{stat.value}</div>
                <div className="text-xs font-mono text-muted-foreground leading-tight">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Manifesto ────────────────────────────────────────────────────────── */}
      <section className="py-20 border-b border-border/50">
        <div className="container max-w-4xl">
          <div className="text-xs font-mono tracking-widest uppercase text-muted-foreground mb-8">// The Problem</div>
          <div className="space-y-6 text-lg font-mono text-muted-foreground leading-relaxed">
            <p>
              <span className="text-foreground font-semibold">Every day, billions of people drink the digital punch</span> — sharing, liking, and amplifying content they never verified. Fabricated screenshots. Deepfake videos. AI-generated news. Emotionally manipulative headlines designed to bypass your critical thinking.
            </p>
            <p>
              The algorithm doesn't care if it's true. It cares if it makes you react. And you do. We all do. Because we're human, and humans are wired to respond to fear, outrage, and tribalism.
            </p>
            <p className="text-foreground">
              <span className="text-primary">Don't Drink the Digital Punch</span> is the antidote. We give you the tools, the knowledge, and the community to fight back. Not with censorship. Not with silence. With <span className="text-primary">critical thinking at scale.</span>
            </p>
          </div>
        </div>
      </section>

      {/* ── Content Pillars ──────────────────────────────────────────────────── */}
      <section className="py-20 border-b border-border/50">
        <div className="container">
          <div className="flex items-center gap-4 mb-12">
            <div className="text-xs font-mono tracking-widest uppercase text-muted-foreground">// Your Arsenal</div>
            <hr className="flex-1 section-divider" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CONTENT_PILLARS.map((pillar) => (
              <Link
                key={pillar.href}
                href={pillar.href}
                className={`group p-6 bg-card border rounded-sm transition-all no-underline ${pillar.border}`}
              >
                <div className={`text-xs font-mono tracking-widest uppercase mb-2 ${pillar.accent}`}>
                  {pillar.tag}
                </div>
                <h3 className="text-2xl font-display tracking-wide text-foreground mb-3 group-hover:text-primary transition-colors">
                  {pillar.tagline}
                </h3>
                <p className="text-sm font-mono text-muted-foreground leading-relaxed mb-4">{pillar.desc}</p>
                <span className={`text-xs font-mono ${pillar.accent} group-hover:underline`}>{pillar.cta}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Hoaxes ──────────────────────────────────────────────────── */}
      <section className="py-20 border-b border-border/50">
        <div className="container">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-4">
              <div className="text-xs font-mono tracking-widest uppercase text-muted-foreground">// Recently Debunked</div>
              <hr className="w-20 section-divider" />
            </div>
            <Link href="/lab" className="text-xs font-mono text-primary hover:underline no-underline">
              View All →
            </Link>
          </div>
          {featuredHoaxes && featuredHoaxes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {featuredHoaxes.map((hoax) => (
                <Link
                  key={hoax.id}
                  href={`/lab`}
                  className="group p-5 bg-card border border-border/50 hover:border-primary/30 rounded-sm transition-all no-underline"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className={hoax.verdict === "false" ? "verdict-false" : hoax.verdict === "misleading" ? "verdict-misleading" : "verdict-missing-context"}>
                      {hoax.verdict.replace("_", " ").toUpperCase()}
                    </span>
                    {hoax.category && (
                      <span className="text-xs font-mono text-muted-foreground">{hoax.category}</span>
                    )}
                  </div>
                  <h3 className="text-base font-display tracking-wide text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                    {hoax.title}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{hoax.summary}</p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { title: "Fabricated Celebrity Endorsement Goes Viral", verdict: "FALSE", cat: "Social Media" },
                { title: "Deepfake Political Speech Spreads Across Platforms", verdict: "MISLEADING", cat: "Deepfakes" },
                { title: "AI-Generated News Article Fools Thousands", verdict: "FALSE", cat: "AI Content" },
              ].map((item, i) => (
                <div key={i} className="p-5 bg-card border border-border/50 rounded-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={i === 1 ? "verdict-misleading" : "verdict-false"}>{item.verdict}</span>
                    <span className="text-xs font-mono text-muted-foreground">{item.cat}</span>
                  </div>
                  <h3 className="text-base font-display tracking-wide text-foreground mb-2 line-clamp-2">{item.title}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">Deconstructed and verified. See how it was made and why it spread.</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────────────────────── */}
      {featuredTestimonials && featuredTestimonials.length > 0 && (
        <section className="py-20 border-b border-border/50">
          <div className="container">
            <div className="flex items-center gap-4 mb-10">
              <div className="text-xs font-mono tracking-widest uppercase text-muted-foreground">// Real People, Real Stories</div>
              <hr className="flex-1 section-divider" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {featuredTestimonials.map((t) => (
                <div key={t.id} className="p-5 bg-card border border-border/50 rounded-sm">
                  <div className="text-3xl mb-3 text-muted-foreground/40 font-display">"</div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-4">{t.story}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-foreground">{t.displayName ?? "Anonymous"}</span>
                    {t.duration && <span className="text-xs font-mono text-muted-foreground">{t.duration}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ──────────────────────────────────────────────────────────────── */}
      <section className="py-24">
        <div className="container max-w-3xl text-center">
          <div className="text-xs font-mono tracking-widest uppercase text-primary mb-4">
            // Your Share Button Is Not a "Believe Me" Stamp
          </div>
          <h2 className="text-5xl md:text-7xl font-display tracking-widest text-foreground mb-6">
            STOP SIPPING<br />
            <span className="text-primary">THE SCRIPT</span>
          </h2>
          <p className="text-muted-foreground font-mono mb-10 leading-relaxed">
            Sharing isn't caring if you're passing the poison cup.<br />
            Research before you pass the cup.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {!isAuthenticated ? (
              <a
                href={getLoginUrl()}
                className="px-8 py-3 bg-primary text-primary-foreground font-mono tracking-widest uppercase text-sm hover:bg-primary/90 transition-all rounded-sm no-underline"
              >
                Join the Movement
              </a>
            ) : (
              <Link
                href="/toolkit"
                className="px-8 py-3 bg-primary text-primary-foreground font-mono tracking-widest uppercase text-sm hover:bg-primary/90 transition-all rounded-sm no-underline"
              >
                Verify Something Now
              </Link>
            )}
            <Link
              href="/donate"
              className="px-8 py-3 border border-border text-muted-foreground font-mono tracking-widest uppercase text-sm hover:border-primary/50 hover:text-foreground transition-all rounded-sm no-underline"
            >
              Support the Mission
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

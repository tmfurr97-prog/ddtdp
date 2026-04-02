import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";

const LOGO_MP4 = "https://d2xsxph8kpxj0f.cloudfront.net/310519663452175762/3xUiue9tuXw8UZaZ8hqjt9/Title_f2c56a38.mp4";

const CONTENT_PILLARS = [
  {
    href: "/toolkit",
    tag: "VERIFY",
    tagline: "Don't swallow the hype.",
    desc: "The loudest lies taste the sweetest. Scan it before you share it.",
    cta: "VERIFY NOW →",
  },
  {
    href: "/lab",
    tag: "TRACKER",
    tagline: "Expose the lie.",
    desc: "Tear it up. See where it came from and how it spread.",
    cta: "TRACE IT →",
  },
  {
    href: "/sober-up",
    tag: "STORIES",
    tagline: "Don't get drunk on the feed.",
    desc: "Sober up. Real people sharing real wake-up calls.",
    cta: "READ STORIES →",
  },
  {
    href: "/train-up",
    tag: "LEARN",
    tagline: "Train your brain. Not your thumb.",
    desc: "Build your immunity before the next cycle starts.",
    cta: "UNLOCK ACCESS →",
  },
];

export default function Home() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center p-4 md:p-8 overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-500 rounded-full mix-blend-screen filter blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-72 h-72 bg-red-500 rounded-full mix-blend-screen filter blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8">
          {/* Logo Video */}
          <div className="mb-8">
            <video
              autoPlay
              muted
              loop
              playsInline
              className="w-full max-w-sm mx-auto rounded-lg"
            >
              <source src={LOGO_MP4} type="video/mp4" />
            </video>
          </div>

          {/* Main Headline with Glitch Effect */}
          <h1 className="text-5xl md:text-7xl font-black leading-tight tracking-tighter">
            <span className="block text-white drop-shadow-lg">DON'T</span>
            <span className="block text-white drop-shadow-lg">DRINK THE</span>
            <span className="block bg-gradient-to-r from-cyan-400 via-cyan-300 to-cyan-400 bg-clip-text text-transparent drop-shadow-lg">
              DIGITAL PUNCH
            </span>
          </h1>

          {/* Subheading */}
          <div className="max-w-3xl mx-auto space-y-4">
            <p className="text-lg md:text-xl text-foreground leading-relaxed font-semibold">
              AI didn't invent lying. It just made it scalable.
            </p>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
              Right now, bad actors are using it to flood your feed with fake photos, deepfakes, and fabricated stories that look 100% real. You can't trust what you see anymore.
            </p>
            <p className="text-base md:text-lg text-foreground leading-relaxed font-semibold">
              If you aren't verifying your sources, you're being played.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            {isAuthenticated ? (
              <>
                <Link
                  href="/toolkit"
                  className="px-8 py-4 bg-cyan-500 text-black font-bold text-lg rounded-lg hover:bg-cyan-400 transition-all no-underline"
                >
                  START VERIFYING
                </Link>
                <Link
                  href="/check"
                  className="px-8 py-4 bg-transparent border-2 border-cyan-500 text-cyan-400 font-bold text-lg rounded-lg hover:bg-cyan-500/10 transition-all no-underline"
                >
                  FACT CHECK NOW
                </Link>
              </>
            ) : (
              <>
                <a
                  href={getLoginUrl()}
                  className="px-8 py-4 bg-cyan-500 text-black font-bold text-lg rounded-lg hover:bg-cyan-400 transition-all no-underline"
                >
                  SIGN IN & VERIFY
                </a>
                <Link
                  href="/lab"
                  className="px-8 py-4 bg-transparent border-2 border-cyan-500 text-cyan-400 font-bold text-lg rounded-lg hover:bg-cyan-500/10 transition-all no-underline"
                >
                  EXPLORE HOAXES
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Content Pillars */}
      <section className="py-20 px-4 md:px-8 bg-secondary/20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black mb-16 text-center">
            How We Fight Back
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {CONTENT_PILLARS.map((pillar) => (
              <Link
                key={pillar.href}
                href={pillar.href}
                className="group p-6 rounded-lg border border-border/50 hover:border-cyan-500/50 hover:bg-secondary/50 transition-all no-underline"
              >
                <div className="flex items-start gap-4">
                  <div className="px-3 py-1 bg-cyan-500/20 text-cyan-400 text-xs font-bold rounded-full">
                    {pillar.tag}
                  </div>
                </div>
                <h3 className="text-2xl font-black mt-4 text-foreground group-hover:text-cyan-400 transition-colors">
                  {pillar.tagline}
                </h3>
                <p className="text-muted-foreground mt-2 mb-4">{pillar.desc}</p>
                <div className="text-cyan-400 font-bold text-sm group-hover:translate-x-2 transition-transform">
                  {pillar.cta}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 px-4 md:px-8 bg-gradient-to-r from-cyan-500/10 to-red-500/10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-4xl md:text-5xl font-black">
            The Truth Doesn't Spread Itself
          </h2>
          <p className="text-lg text-muted-foreground">
            Join thousands of people building immunity to misinformation. Start verifying today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <Link
                href="/toolkit"
                className="px-8 py-4 bg-cyan-500 text-black font-bold rounded-lg hover:bg-cyan-400 transition-all no-underline"
              >
                ACCESS ALL TOOLS
              </Link>
            ) : (
              <a
                href={getLoginUrl()}
                className="px-8 py-4 bg-cyan-500 text-black font-bold rounded-lg hover:bg-cyan-400 transition-all no-underline"
              >
                GET STARTED FREE
              </a>
            )}
            <Link
              href="/premium"
              className="px-8 py-4 border-2 border-cyan-500 text-cyan-400 font-bold rounded-lg hover:bg-cyan-500/10 transition-all no-underline"
            >
              EXPLORE PREMIUM
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

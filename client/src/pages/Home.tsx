import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";

const LOGO_MP4 = "https://d2xsxph8kpxj0f.cloudfront.net/310519663452175762/3xUiue9tuXw8UZaZ8hqjt9/Title_f2c56a38.mp4";
const LOGO_SVG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663452175762/3xUiue9tuXw8UZaZ8hqjt9/Title_944f7b9c.svg";

const CONTENT_PILLARS = [
  {
    href: "/lab",
    tag: "TEAR IT UP",
    tagline: "See how it was built.",
    desc: "Break the lie down. Where it started. How it spread. Why it worked.",
    cta: "Enter the Lab →",
    accent: "text-accent",
    border: "border-accent/20 hover:border-accent/50",
  },
  {
    href: "/toolkit",
    tag: "VERIFY",
    tagline: "Don’t swallow the hype.",
    desc: "Scan it. Test it. Know what you’re sharing before you spread it.",
    cta: "VERIFY NOW →",
    accent: "text-primary",
    border: "border-primary/20 hover:border-primary/50",
  },
  {
    href: "/sober-up",
    tag: "STORIES",
    tagline: "We all took a sip. Fix it.",
    desc: "Real people. Real mistakes. Learn how it happens so it doesn’t happen again.",
    cta: "Read Stories →",
    accent: "text-purple-400",
    border: "border-purple-400/20 hover:border-purple-400/50",
  },
  {
    href: "/train-up",
    tag: "BUILD IMMUNITY",
    tagline: "Train your brain. Not your thumb.",
    desc: "Learn the tactics before they’re used on you.",
    cta: "UNLOCK ACCESS →",
    accent: "text-green-400",
    border: "border-green-400/20 hover:border-green-400/50",
  },
];

const STATS = [
  { value: "2.3B", label: "Pieces of misinformation shared daily" },
  { value: "70%", label: "Can’t spot a deepfake" },
  { value: "6x", label: "Spreads faster than truth" },
  { value: "92%", label: "Never verify before sharing" },
];

export default function Home() {
  const { isAuthenticated } = useAuth();
  const { data: featuredHoaxes } = trpc.hoaxes.featured.useQuery();
  const { data: featuredTestimonials } = trpc.testimonials.featured.useQuery();

  return (
    <div>
      {/* HERO */}
      <section className="relative min-h-[85vh] flex flex-col items-center justify-center border-b border-border/50">
        <div className="container text-center py-20">

          <div className="mb-8 flex justify-center">
            <video src={LOGO_MP4} autoPlay loop muted playsInline className="h-32 md:h-48 w-auto" poster={LOGO_SVG} />
          </div>

          <h1 className="text-6xl md:text-8xl font-display tracking-widest mb-4">
            DON'T<br />DRINK THE<br /><span className="text-primary">DIGITAL PUNCH</span>
          </h1>

          <p className="text-lg font-mono text-muted-foreground mb-10">
            Lies go down easy.<br />
            <span className="text-foreground">Truth takes grit.</span>
          </p>

          <div className="flex gap-4 justify-center">
            {!isAuthenticated ? (
              <a href={getLoginUrl()} className="px-6 py-3 bg-primary text-primary-foreground font-mono uppercase">
                JOIN
              </a>
            ) : (
              <Link href="/toolkit" className="px-6 py-3 bg-primary text-primary-foreground font-mono uppercase">
                VERIFY NOW
              </Link>
            )}

            <Link href="/lab" className="px-6 py-3 border font-mono uppercase">
              SEE THE EVIDENCE
            </Link>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="py-10 border-b">
        <div className="grid grid-cols-2 md:grid-cols-4 text-center">
          {STATS.map((s) => (
            <div key={s.value}>
              <div className="text-3xl text-primary">{s.value}</div>
              <div className="text-xs">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CORE MESSAGE */}
      <section className="py-16 text-center max-w-3xl mx-auto">
        <p>Most people share before they think.</p>
        <p>Fake screenshots. Deepfakes. Manufactured outrage.</p>
        <p>The algorithm rewards reaction, not truth.</p>
        <p><strong>Don’t Drink the Digital Punch.</strong></p>
      </section>

      {/* PILLARS */}
      <section className="py-20 grid md:grid-cols-2 gap-6 container">
        {CONTENT_PILLARS.map((p) => (
          <Link key={p.href} href={p.href} className="p-6 border">
            <div className="text-xs uppercase">{p.tag}</div>
            <h3 className="text-xl">{p.tagline}</h3>
            <p className="text-sm">{p.desc}</p>
            <span>{p.cta}</span>
          </Link>
        ))}
      </section>

      {/* CTA */}
      <section className="py-20 text-center">
        <h2 className="text-5xl">STOP SIPPING THE SCRIPT</h2>
        <p>Sharing spreads it. Make sure it isn’t poison.</p>

        <div className="flex gap-4 justify-center mt-6">
          <Link href="/toolkit" className="px-6 py-3 bg-primary text-primary-foreground">
            VERIFY NOW
          </Link>
          <Link href="/donate" className="px-6 py-3 border">
            SUPPORT
          </Link>
        </div>
      </section>
    </div>
  );
}

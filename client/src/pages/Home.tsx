import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";

const LOGO_MP4 = "https://d2xsxph8kpxj0f.cloudfront.net/310519663452175762/3xUiue9tuXw8UZaZ8hqjt9/Title_f2c56a38.mp4";

const CONTENT_PILLARS = [
  {
    href: "/toolkit",
    tag: "VERIFY",
    tagline: "Don’t swallow the hype.",
    desc: "The loudest lies taste the sweetest. Don’t swallow them.",
    cta: "VERIFY NOW →",
  },
  {
    href: "/tracker",
    tag: "TEAR IT UP",
    tagline: "Expose the lie.",
    desc: "Peel the label off the story. See how the poison was made.",
    cta: "SEE THE EVIDENCE →",
  },
  {
    href: "/sober-up",
    tag: "SOBER UP",
    tagline: "Don’t get drunk on the feed.",
    desc: "Algorithms love an angry drunk. Stay sober. Stay sharp.",
    cta: "READ STORIES →",
  },
  {
    href: "/train-up",
    tag: "IMMUNITY",
    tagline: "Train your brain. Not your thumb.",
    desc: "Learn the tactics before they are used on you.",
    cta: "BUILD IMMUNITY →",
  },
];

const STATS = [
  { value: "2.3B", label: "Lies shared daily" },
  { value: "70%", label: "Miss the fake" },
  { value: "6x", label: "Faster than truth" },
  { value: "92%", label: "Don’t verify" },
];

export default function Home() {
  const { isAuthenticated } = useAuth();
  const { data: featuredHoaxes } = trpc.hoaxes.featured.useQuery();

  return (
    <div className="bg-white text-black">

      {/* HERO SECTION */}
      <section className="text-center py-20 border-b">
        <video src={LOGO_MP4} autoPlay loop muted className="h-32 mx-auto mb-6" />

        <h1 className="text-6xl font-black mb-4 tracking-tighter">
          DON'T DRINK THE DIGITAL PUNCH
        </h1>

        <p className="text-xl mb-8 uppercase tracking-widest font-light">
          Lies go down easy. <span className="font-bold">Truth takes grit.</span>
        </p>

        <div className="flex gap-4 justify-center">
          {!isAuthenticated ? (
            <a href={getLoginUrl()} className="px-8 py-4 bg-black text-white font-bold hover:bg-red-600 transition-colors">
              JOIN THE RESISTANCE
            </a>
          ) : (
            <Link href="/toolkit" className="px-8 py-4 bg-black text-white font-bold hover:bg-red-600 transition-colors">
              VERIFY NOW
            </Link>
          )}

          <Link href="/tracker" className="px-8 py-4 border-2 border-black font-bold hover:invert transition-all">
            TEAR IT UP
          </Link>
        </div>
      </section>

      {/* STATS - THE COLD HARD NUMBERS */}
      <section className="grid grid-cols-2 md:grid-cols-4 text-center py-12 bg-gray-50">
        {STATS.map((s) => (
          <div key={s.value} className="border-r last:border-r-0 border-gray-200">
            <div className="text-4xl font-black">{s.value}</div>
            <div className="text-xs uppercase font-bold text-gray-500">{s.label}</div>
          </div>
        ))}
      </section>

      {/* CORE CONFRONTATION */}
      <section className="text-center max-w-3xl mx-auto py-24 px-6">
        <h2 className="text-3xl font-bold mb-8 italic">"Most people share before they think."</h2>
        <div className="space-y-4 text-lg">
          <p>Fake content spreads because it works.</p>
          <p>The algorithm rewards reaction, not truth.</p>
          <p className="text-2xl font-black uppercase underline">Don’t be part of it.</p>
        </div>
      </section>

      {/* CONTENT PILLARS */}
      <section className="grid md:grid-cols-2 gap-8 px-6 py-20 max-w-6xl mx-auto">
        {CONTENT_PILLARS.map((p) => (
          <Link key={p.tag} href={p.href} className="border-4 border-black p-8 block hover:bg-black hover:text-white transition-all group">
            <div className="text-sm font-black mb-2 opacity-50 group-hover:opacity-100">{p.tag}</div>
            <h3 className="text-3xl font-black mb-4 uppercase">{p.tagline}</h3>
            <p className="text-md mb-6 leading-relaxed">{p.desc}</p>
            <span className="font-bold border-b-2 border-current">{p.cta}</span>
          </Link>
        ))}
      </section>

      {/* THE FINAL WARNING */}
      <section className="text-center py-32 bg-black text-white">
        <h2 className="text-5xl font-black mb-6 tracking-tighter">STOP SWALLOWING THE SCRIPT</h2>
        <p className="text-xl max-w-xl mx-auto mb-10 opacity-80">
          THINK BEFORE YOU PASS THE PUNCH. Sharing spreads it. Make sure it

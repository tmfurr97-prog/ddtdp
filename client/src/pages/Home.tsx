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
    desc: "The loudest lies taste the sweetest. Scan it before you share it.",
    cta: "VERIFY NOW →",
  },
  {
    href: "/tracker",
    tag: "TRACKER",
    tagline: "Expose the lie.",
    desc: "Tear it up. See where it came from and how it spread.",
    cta: "TRACE IT →",
  },
  {
    href: "/sober-up",
    tag: "STORIES",
    tagline: "Don’t get drunk on the feed.",
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

const STATS = [
  { value: "2.3B", label: "Shared daily" },
  { value: "70%", label: "Miss deepfakes" },
  { value: "6x", label: "Faster than truth" },
  { value: "92%", label: "Don’t verify" },
];

export default function Home() {
  const { isAuthenticated } = useAuth();
  const { data: featuredHoaxes } = trpc.hoaxes.featured.useQuery();

  return (
    <div className="bg-white text-black">

      {/* HERO SECTION */}
      <section className="text-center py-20 border-b-2 border-black">
        <video src={LOGO_MP4} autoPlay loop muted className="h-32 mx-auto mb-6" />

        <h1 className="text-6xl font-black mb-4 tracking-tighter uppercase">
          DON'T DRINK THE DIGITAL PUNCH
        </h1>

        <p className="text-xl mb-8 font-medium">
          Lies go down easy. <span className="underline decoration-red-600">Truth takes grit.</span>
        </p>

        <div className="flex gap-4 justify-center">
          {!isAuthenticated ? (
            <a href={getLoginUrl()} className="px-8 py-4 bg-black text-white font-bold hover:bg-red-600 transition-colors">
              JOIN THE SQUAD
            </a>
          ) : (
            <Link href="/toolkit" className="px-8 py-4 bg-black text-white font-bold hover:bg-red-600 transition-colors">
              VERIFY NOW
            </Link>
          )}

          <Link href="/tracker" className="px-8 py-4 border-2 border-black font-bold hover:bg-gray-100 transition-all">
            SEE THE EVIDENCE
          </Link>
        </div>

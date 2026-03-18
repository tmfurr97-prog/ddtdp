import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";

const FREE_FEATURES = [
  "URL Credibility Analyzer",
  "Text Manipulation Scanner",
  "Email Phishing Detector",
  "Video Deepfake Analyzer",
  "Deconstruct Lab (public archive)",
  "Sober Up community stories",
  "Basic training modules (3 free)",
  "Submit tips & stories",
];

const PREMIUM_FEATURES = [
  "Everything in Free",
  "Full training library (12+ modules)",
  "Advanced logical fallacies guide",
  "Deepfake detection deep-dive",
  "Platform manipulation playbooks",
  "State-sponsored disinformation guide",
  "Weekly misinformation briefing",
  "Priority tip review",
  "Partner badge on profile",
  "Ad-free experience",
  "Early access to new tools",
  "Discord community access",
];

const MERCH_ITEMS = [
  { name: "Don't Drink the Punch Tee", price: "$32", desc: "100% organic cotton. The message is the medium.", tag: "Best Seller" },
  { name: "Critical Thinker Hoodie", price: "$58", desc: "Heavyweight fleece. Wear your resistance.", tag: null },
  { name: "Verify Before You Share Mug", price: "$22", desc: "For the morning ritual of not being fooled.", tag: null },
  { name: "Misinformation Is a Weapon Tote", price: "$28", desc: "Carry the message everywhere.", tag: "New" },
  { name: "Digital Punch Enamel Pin Set", price: "$18", desc: "Three pins. One mission.", tag: null },
  { name: "Fact-Check First Sticker Pack", price: "$12", desc: "10 stickers. Spread the antidote.", tag: null },
];

export default function Premium() {
  const { isAuthenticated } = useAuth();
  const [plan, setPlan] = useState<"monthly" | "annual">("annual");

  const { data: membership } = trpc.memberships.myMembership.useQuery(undefined, { enabled: isAuthenticated });
  const upgrade = trpc.memberships.upgrade.useMutation({
    onSuccess: () => toast.success("Welcome to Premium! Your account has been upgraded."),
    onError: (err) => toast.error(err.message),
  });

  const isPremium = membership?.tier === "premium" && membership?.status === "active";

  return (
    <div className="min-h-screen py-12">
      <div className="container">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="text-xs font-mono tracking-widest uppercase text-primary mb-3">// Go Premium</div>
          <h1 className="text-5xl md:text-7xl font-display tracking-widest text-foreground mb-4">
            GO<br />
            <span className="text-primary">DEEPER</span>
          </h1>
          <p className="text-muted-foreground font-mono max-w-xl mx-auto leading-relaxed">
            The full arsenal. Advanced training, premium tools, and a community of critical thinkers who refuse to be played.
          </p>
        </div>

        {/* Plan Toggle */}
        <div className="flex justify-center mb-10">
          <div className="flex bg-card border border-border/50 rounded-sm overflow-hidden">
            <button
              onClick={() => setPlan("monthly")}
              className={`px-6 py-2.5 text-xs font-mono tracking-widest uppercase transition-all ${plan === "monthly" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setPlan("annual")}
              className={`px-6 py-2.5 text-xs font-mono tracking-widest uppercase transition-all ${plan === "annual" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              Annual <span className="text-green-400 ml-1">-40%</span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto mb-16">
          {/* Free */}
          <div className="p-6 bg-card border border-border/50 rounded-sm">
            <div className="text-xs font-mono tracking-widest uppercase text-muted-foreground mb-2">Free</div>
            <div className="text-4xl font-display tracking-widest text-foreground mb-1">$0</div>
            <div className="text-xs font-mono text-muted-foreground mb-6">Forever free</div>
            <ul className="space-y-2 mb-6">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2 text-xs font-mono text-muted-foreground">
                  <span className="text-green-400 mt-0.5 shrink-0">✓</span>
                  {f}
                </li>
              ))}
            </ul>
            {!isAuthenticated ? (
              <a
                href={getLoginUrl()}
                className="block w-full py-2.5 border border-border text-muted-foreground text-center font-mono tracking-widest uppercase text-xs hover:border-primary/30 hover:text-foreground transition-all rounded-sm no-underline"
              >
                Get Started Free
              </a>
            ) : (
              <div className="w-full py-2.5 border border-border/30 text-muted-foreground/50 text-center font-mono tracking-widest uppercase text-xs rounded-sm">
                Current Plan
              </div>
            )}
          </div>

          {/* Premium */}
          <div className="p-6 bg-card border border-primary/30 rounded-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-mono tracking-widest uppercase px-3 py-1">
              Recommended
            </div>
            <div className="text-xs font-mono tracking-widest uppercase text-primary mb-2">Premium</div>
            <div className="text-4xl font-display tracking-widest text-foreground mb-1">
              {plan === "annual" ? "$7" : "$12"}
              <span className="text-lg text-muted-foreground">/mo</span>
            </div>
            <div className="text-xs font-mono text-muted-foreground mb-6">
              {plan === "annual" ? "Billed $84/year — save $60" : "Billed monthly"}
            </div>
            <ul className="space-y-2 mb-6">
              {PREMIUM_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2 text-xs font-mono text-foreground">
                  <span className="text-primary mt-0.5 shrink-0">✓</span>
                  {f}
                </li>
              ))}
            </ul>
            {isPremium ? (
              <div className="w-full py-2.5 bg-green-500/10 border border-green-400/30 text-green-400 text-center font-mono tracking-widest uppercase text-xs rounded-sm">
                Active Premium Member
              </div>
            ) : !isAuthenticated ? (
              <a
                href={getLoginUrl()}
                className="block w-full py-2.5 bg-primary text-primary-foreground text-center font-mono tracking-widest uppercase text-xs hover:bg-primary/90 transition-all rounded-sm no-underline pulse-cyan"
              >
                Join Premium
              </a>
            ) : (
              <button
                onClick={() => upgrade.mutate({ plan })}
                disabled={upgrade.isPending}
                className="w-full py-2.5 bg-primary text-primary-foreground font-mono tracking-widest uppercase text-xs hover:bg-primary/90 disabled:opacity-50 transition-all rounded-sm pulse-cyan"
              >
                {upgrade.isPending ? "Processing..." : `Upgrade to Premium`}
              </button>
            )}
          </div>
        </div>

        {/* Merch Section */}
        <div className="border-t border-border/50 pt-16">
          <div className="flex items-center gap-4 mb-8">
            <div className="text-xs font-mono tracking-widest uppercase text-muted-foreground">// Merch</div>
            <hr className="flex-1 section-divider" />
            <div className="text-xs font-mono text-muted-foreground">Wear the resistance</div>
          </div>
          <div className="mb-6">
            <h2 className="text-4xl font-display tracking-widest text-foreground mb-2">
              WEAR THE <span className="text-accent">MESSAGE</span>
            </h2>
            <p className="text-sm font-mono text-muted-foreground">
              Every purchase supports the mission. 10% of proceeds go to media literacy education programs.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {MERCH_ITEMS.map((item) => (
              <div key={item.name} className="group p-5 bg-card border border-border/50 hover:border-accent/30 rounded-sm transition-all relative">
                {item.tag && (
                  <div className="absolute top-3 right-3 text-xs font-mono text-accent border border-accent/30 px-2 py-0.5 rounded-sm">
                    {item.tag}
                  </div>
                )}
                <div className="w-full h-32 bg-secondary/30 rounded-sm mb-4 flex items-center justify-center">
                  <span className="text-4xl opacity-20">👕</span>
                </div>
                <h3 className="text-base font-display tracking-wide text-foreground mb-1 group-hover:text-accent transition-colors">{item.name}</h3>
                <p className="text-xs font-mono text-muted-foreground mb-3">{item.desc}</p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-display text-foreground">{item.price}</span>
                  <button
                    onClick={() => toast.info("Merch store coming soon! Join Premium to get early access.")}
                    className="text-xs font-mono text-accent/70 hover:text-accent transition-colors"
                  >
                    Add to Cart →
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 p-4 bg-secondary/20 border border-border/30 rounded-sm text-center">
            <p className="text-xs font-mono text-muted-foreground">
              🚧 Merch store launching soon. <button onClick={() => toast.info("You'll be notified when the merch store launches!")} className="text-primary hover:underline">Get notified →</button>
            </p>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-16 border-t border-border/50 pt-12">
          <div className="text-xs font-mono tracking-widest uppercase text-muted-foreground mb-8">// FAQ</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
            {[
              { q: "Can I cancel anytime?", a: "Yes. Cancel anytime from your profile. You keep access until the end of your billing period." },
              { q: "Is there a free trial?", a: "The free tier gives you access to all core tools. Premium unlocks the full training library and advanced content." },
              { q: "How does the merch support the mission?", a: "10% of all merch proceeds go directly to media literacy education programs and fact-checking organizations." },
              { q: "What payment methods do you accept?", a: "We accept all major credit cards, PayPal, and Apple Pay. Payment processing coming soon." },
            ].map((faq) => (
              <div key={faq.q} className="p-5 bg-card border border-border/50 rounded-sm">
                <div className="text-sm font-display tracking-wide text-foreground mb-2">{faq.q}</div>
                <p className="text-xs font-mono text-muted-foreground leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

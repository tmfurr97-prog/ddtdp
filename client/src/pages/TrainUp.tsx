import { trpc } from "@/lib/trpc";
import { Link } from "wouter";

const TRAINING_MODULES = [
  {
    category: "Foundations",
    color: "text-primary",
    border: "border-primary/20",
    modules: [
      { title: "The Anatomy of a Viral Lie", desc: "How misinformation is engineered, packaged, and deployed for maximum spread.", duration: "12 min read", free: true },
      { title: "Your Brain on Misinformation", desc: "The cognitive biases that make all of us vulnerable — confirmation bias, the illusory truth effect, and more.", duration: "15 min read", free: true },
      { title: "The SIFT Method", desc: "Stop, Investigate the source, Find better coverage, Trace claims. A practical 4-step framework.", duration: "8 min read", free: true },
    ],
  },
  {
    category: "Manipulation Tactics",
    color: "text-accent",
    border: "border-accent/20",
    modules: [
      { title: "Emotional Manipulation in Media", desc: "How fear, outrage, and tribalism are weaponized to bypass critical thinking.", duration: "18 min read", free: true },
      { title: "Logical Fallacies Field Guide", desc: "The 20 most common logical fallacies used in misinformation — with real examples.", duration: "25 min read", free: false },
      { title: "Astroturfing & Coordinated Inauthentic Behavior", desc: "How fake grassroots movements are manufactured and how to spot them.", duration: "20 min read", free: false },
    ],
  },
  {
    category: "Technical Detection",
    color: "text-yellow-400",
    border: "border-yellow-400/20",
    modules: [
      { title: "Deepfake Detection: A Practical Guide", desc: "Visual and auditory cues that reveal synthetic media. What to look for, frame by frame.", duration: "22 min read", free: false },
      { title: "Reverse Image Search Mastery", desc: "Advanced techniques for tracing image origins, finding original context, and identifying manipulation.", duration: "14 min read", free: true },
      { title: "Reading Domain Names & URLs", desc: "How to spot spoofed domains, lookalike URLs, and other technical deception tactics.", duration: "10 min read", free: true },
    ],
  },
  {
    category: "Platform Literacy",
    color: "text-green-400",
    border: "border-green-400/20",
    modules: [
      { title: "How Algorithms Amplify Misinformation", desc: "The engagement-maximizing mechanics that make platforms inadvertent misinformation machines.", duration: "16 min read", free: false },
      { title: "Social Media Verification Toolkit", desc: "Platform-specific verification techniques for Twitter/X, TikTok, Instagram, and Facebook.", duration: "20 min read", free: false },
      { title: "The Firehose of Falsehood", desc: "Understanding state-sponsored disinformation campaigns and their tactics.", duration: "30 min read", free: false },
    ],
  },
];

const QUICK_TIPS = [
  "Before sharing, ask: 'How do I know this is true?'",
  "Check the URL — not just the headline",
  "Look for the original source, not just the reshare",
  "Emotional content that makes you angry is often designed to bypass critical thinking",
  "Absence of evidence is not evidence of absence — but extraordinary claims need extraordinary evidence",
  "Check when the article was published — old news is often reshared as current",
  "Reverse image search any viral photo before sharing",
  "If a story only appears on one site, be very skeptical",
];

export default function TrainUp() {
  const { data: resources } = trpc.resources.freeOnly.useQuery({ limit: 6 });

  return (
    <div className="min-h-screen py-12">
      <div className="container">
        {/* Header */}
        <div className="mb-12">
          <div className="text-xs font-mono tracking-widest uppercase text-green-400 mb-3">// Train Up</div>
          <h1 className="text-5xl md:text-7xl font-display tracking-widest text-foreground mb-4">
            BUILD YOUR<br />
            <span className="text-green-400">IMMUNITY</span>
          </h1>
          <p className="text-muted-foreground font-mono max-w-2xl leading-relaxed">
            Guides, frameworks, and deep-dives on manipulation tactics, logical fallacies, deepfake detection, and algorithmic influence. Knowledge is the antidote.
          </p>
        </div>

        {/* Quick Tips Ticker */}
        <div className="bg-card border border-border/50 rounded-sm p-4 mb-12 overflow-hidden">
          <div className="text-xs font-mono tracking-widest uppercase text-muted-foreground mb-3">// Quick Reminders</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {QUICK_TIPS.map((tip, i) => (
              <div key={i} className="flex items-start gap-2 text-xs font-mono text-muted-foreground">
                <span className="text-primary shrink-0 mt-0.5">▸</span>
                <span>{tip}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Training Modules */}
        <div className="space-y-10">
          {TRAINING_MODULES.map((section) => (
            <div key={section.category}>
              <div className="flex items-center gap-4 mb-5">
                <div className={`text-xs font-mono tracking-widest uppercase ${section.color}`}>{section.category}</div>
                <hr className="flex-1 section-divider" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {section.modules.map((module) => (
                  <div
                    key={module.title}
                    className={`group p-5 bg-card border rounded-sm transition-all ${section.border} hover:bg-secondary/20`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-mono text-muted-foreground">{module.duration}</span>
                      {module.free ? (
                        <span className="text-xs font-mono text-green-400 border border-green-400/30 px-2 py-0.5 rounded-sm">FREE</span>
                      ) : (
                        <span className="text-xs font-mono text-primary border border-primary/30 px-2 py-0.5 rounded-sm">PREMIUM</span>
                      )}
                    </div>
                    <h3 className={`text-lg font-display tracking-wide text-foreground mb-2 group-hover:${section.color} transition-colors`}>
                      {module.title}
                    </h3>
                    <p className="text-xs font-mono text-muted-foreground leading-relaxed mb-4">{module.desc}</p>
                    {module.free ? (
                      <button className={`text-xs font-mono ${section.color} hover:underline`}>
                        Read Now →
                      </button>
                    ) : (
                      <Link href="/premium" className={`text-xs font-mono ${section.color} hover:underline no-underline`}>
                        Unlock with Premium →
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Premium CTA */}
        <div className="mt-16 p-8 bg-card border border-primary/20 rounded-sm text-center">
          <div className="text-xs font-mono tracking-widest uppercase text-primary mb-3">// Go Deeper</div>
          <h2 className="text-4xl font-display tracking-widest text-foreground mb-4">
            UNLOCK THE FULL ARSENAL
          </h2>
          <p className="text-muted-foreground font-mono max-w-xl mx-auto mb-6 leading-relaxed">
            Premium members get access to all training modules, advanced detection guides, the full logical fallacies field guide, and new content every week.
          </p>
          <Link
            href="/premium"
            className="inline-block px-8 py-3 bg-primary text-primary-foreground font-mono tracking-widest uppercase text-sm hover:bg-primary/90 transition-all rounded-sm no-underline"
          >
            Go Premium
          </Link>
        </div>
      </div>
    </div>
  );
}

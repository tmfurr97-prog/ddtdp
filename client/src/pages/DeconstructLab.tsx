import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";

const CATEGORIES = ["All", "Social Media", "Politics", "Health", "AI Content", "Deepfakes", "Finance", "Celebrity"];

const VERDICT_LABELS: Record<string, string> = {
  false: "FALSE",
  misleading: "MISLEADING",
  missing_context: "MISSING CONTEXT",
  satire: "SATIRE",
  true: "TRUE",
};

function VerdictBadge({ verdict }: { verdict: string }) {
  const cls =
    verdict === "false" ? "verdict-false" :
    verdict === "misleading" ? "verdict-misleading" :
    verdict === "missing_context" ? "verdict-missing-context" :
    verdict === "true" ? "verdict-true" :
    "verdict-missing-context";
  return <span className={cls}>{VERDICT_LABELS[verdict] ?? verdict.toUpperCase()}</span>;
}

const PLACEHOLDER_HOAXES = [
  { id: 1, title: "Fabricated Celebrity Endorsement Goes Viral on TikTok", verdict: "false", category: "Social Media", summary: "A deepfake video showing a major celebrity endorsing a cryptocurrency investment scheme spread to over 2 million views before being flagged. The celebrity had never made any such statement.", viewCount: 14200 },
  { id: 2, title: "Out-of-Context Protest Footage Mislabeled as Current Event", verdict: "misleading", category: "Politics", summary: "Footage from a 2019 protest was shared with captions claiming it showed a recent incident. The video was real but the context was entirely fabricated.", viewCount: 8900 },
  { id: 3, title: "AI-Generated Medical Advice Article Fools Health Blogs", verdict: "false", category: "Health", summary: "A convincingly written article about a new cancer treatment was entirely AI-generated with no scientific basis. It was republished by 47 health blogs before fact-checkers caught it.", viewCount: 22100 },
  { id: 4, title: "Manipulated Quote Screenshot Attributed to Public Figure", verdict: "false", category: "Politics", summary: "A screenshot showing a politician saying something inflammatory was digitally altered. The original quote was about an entirely different topic.", viewCount: 31500 },
  { id: 5, title: "Satire Article Shared as Real News by Thousands", verdict: "satire", category: "Social Media", summary: "An article from a known satire publication was shared without the satire label, with thousands of people believing it was genuine reporting.", viewCount: 5600 },
  { id: 6, title: "Deepfake Audio of Executive Causes Stock Manipulation", verdict: "false", category: "Finance", summary: "AI-generated audio mimicking a CEO's voice was used to spread false information about a company's earnings, briefly affecting stock prices.", viewCount: 18700 },
];

export default function DeconstructLab() {
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", sourceUrl: "" });

  const { data: hoaxes, isLoading } = trpc.hoaxes.list.useQuery({ limit: 20, offset: 0 });
  const submit = trpc.submissions.submit.useMutation({
    onSuccess: () => {
      toast.success("Tip submitted! Our team will review it.");
      setShowForm(false);
      setForm({ title: "", description: "", sourceUrl: "" });
    },
    onError: (err) => toast.error(err.message),
  });

  const displayHoaxes = (hoaxes && hoaxes.length > 0) ? hoaxes : PLACEHOLDER_HOAXES;

  return (
    <div className="min-h-screen py-12">
      <div className="container">
        {/* Header */}
        <div className="mb-12">
          <div className="text-xs font-mono tracking-widest uppercase text-accent mb-3">// Deconstruct Lab</div>
          <h1 className="text-5xl md:text-7xl font-display tracking-widest text-foreground mb-4">
            TEAR IT<br />
            <span className="text-accent">APART</span>
          </h1>
          <p className="text-muted-foreground font-mono max-w-2xl leading-relaxed">
            A living archive of debunked hoaxes, viral lies, and manipulated media. Every entry is broken down to its bones — where it came from, how it spread, why people believed it.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat === "All" ? undefined : cat)}
              className={`px-3 py-1.5 text-xs font-mono tracking-wide rounded-sm transition-all ${
                (cat === "All" && !category) || category === cat
                  ? "bg-primary text-primary-foreground"
                  : "border border-border/50 text-muted-foreground hover:border-primary/30 hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Hoax Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array(6).fill(null).map((_, i) => (
              <div key={i} className="p-5 bg-card border border-border/50 rounded-sm animate-pulse">
                <div className="h-4 bg-secondary rounded mb-3 w-20" />
                <div className="h-5 bg-secondary rounded mb-2" />
                <div className="h-4 bg-secondary rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
            {displayHoaxes.map((hoax) => (
              <div key={hoax.id} className="group p-5 bg-card border border-border/50 hover:border-accent/30 rounded-sm transition-all">
                <div className="flex items-center gap-2 mb-3">
                  <VerdictBadge verdict={hoax.verdict} />
                  {hoax.category && (
                    <span className="text-xs font-mono text-muted-foreground">{hoax.category}</span>
                  )}
                </div>
                <h3 className="text-base font-display tracking-wide text-foreground mb-2 group-hover:text-accent transition-colors line-clamp-2">
                  {hoax.title}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed mb-3">{hoax.summary}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-muted-foreground/50">{(hoax.viewCount ?? 0).toLocaleString()} views</span>
                  <button className="text-xs font-mono text-accent/70 hover:text-accent transition-colors">
                    Read Breakdown →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Submit Tip */}
        <div className="border-t border-border/50 pt-12">
          <div className="max-w-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="text-xs font-mono tracking-widest uppercase text-muted-foreground mb-1">// Spot Something?</div>
                <h2 className="text-3xl font-display tracking-wide text-foreground">Submit a Tip</h2>
              </div>
              <button
                onClick={() => setShowForm(!showForm)}
                className="px-4 py-2 border border-accent/30 text-accent text-xs font-mono tracking-widest uppercase hover:border-accent/60 hover:bg-accent/5 transition-all rounded-sm"
              >
                {showForm ? "Cancel" : "Report Misinformation"}
              </button>
            </div>

            {showForm && (
              <div className="bg-card border border-border/50 rounded-sm p-6 space-y-4">
                <div>
                  <label className="text-xs font-mono tracking-widest uppercase text-muted-foreground block mb-2">Title / Claim *</label>
                  <input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="What is the false claim or misleading content?"
                    className="w-full bg-background border border-border/50 rounded-sm px-4 py-2.5 text-sm font-mono text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono tracking-widest uppercase text-muted-foreground block mb-2">Description *</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Describe the misinformation — where you saw it, how it's being framed, why it's false or misleading..."
                    rows={4}
                    className="w-full bg-background border border-border/50 rounded-sm px-4 py-2.5 text-sm font-mono text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50 transition-colors resize-none"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-mono tracking-widest uppercase text-muted-foreground block mb-2">Source URL</label>
                    <input
                      value={form.sourceUrl}
                      onChange={(e) => setForm({ ...form, sourceUrl: e.target.value })}
                      placeholder="https://..."
                      className="w-full bg-background border border-border/50 rounded-sm px-4 py-2.5 text-sm font-mono text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50 transition-colors"
                    />
                  </div>

                </div>
                <button
                  onClick={() => {
                    if (!form.title || !form.description) {
                      toast.error("Title and description are required");
                      return;
                    }
        submit.mutate({
          title: form.title,
          description: form.description,
          sourceUrl: form.sourceUrl || undefined,
        });
                  }}
                  disabled={submit.isPending}
                  className="px-6 py-2.5 bg-accent text-accent-foreground font-mono tracking-widest uppercase text-xs hover:bg-accent/90 disabled:opacity-50 transition-all rounded-sm"
                >
                  {submit.isPending ? "Submitting..." : "Submit Tip"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

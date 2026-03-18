import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";

type VideoResult = {
  verdict: string;
  risk_score: number;
  manipulation_type: string;
  platform_signals: string[];
  context_red_flags: string[];
  verification_steps: string[];
  known_techniques: string[];
  summary: string;
  confidence: string;
};

const VERDICT_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  likely_authentic: { label: "PROBABLY REAL", color: "text-green-600", bg: "bg-green-50", border: "border-green-300" },
  needs_verification: { label: "NEEDS CHECKING", color: "text-yellow-600", bg: "bg-yellow-50", border: "border-yellow-300" },
  suspicious: { label: "SUSPICIOUS", color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-300" },
  likely_fake: { label: "PROBABLY FAKE", color: "text-red-600", bg: "bg-red-50", border: "border-red-300" },
  known_manipulated: { label: "KNOWN FAKE", color: "text-red-600", bg: "bg-red-50", border: "border-red-300" },
};

const DEEPFAKE_SIGNS = [
  { icon: "👁", title: "Eyes Look Wrong", desc: "Blinking is weird or eyes don't move naturally." },
  { icon: "💡", title: "Lighting Doesn't Match", desc: "The face lighting doesn't match the background." },
  { icon: "🔊", title: "Mouth Doesn't Match Voice", desc: "Lips don't line up with what they're saying." },
  { icon: "🌀", title: "Blurry Edges", desc: "Hair, ears, or face edges look blurry or wrong." },
  { icon: "😐", title: "Face Looks Plastic", desc: "Expressions look fake or frozen." },
  { icon: "🎭", title: "Skin Looks Weird", desc: "Skin is too smooth or has strange artifacts." },
];

export default function VideoAnalyzer() {
  const [videoUrl, setVideoUrl] = useState("");
  const [context, setContext] = useState("");
  const [result, setResult] = useState<VideoResult | null>(null);

  const analyze = trpc.verifications.analyzeVideo.useMutation({
    onSuccess: (data) => setResult(data as VideoResult),
    onError: (err) => toast.error(err.message),
  });

  const verdict = result ? VERDICT_CONFIG[result.verdict] ?? VERDICT_CONFIG.needs_verification : null;

  return (
    <div className="min-h-screen py-12">
      <div className="container max-w-4xl">
        {/* Header */}
        <div className="mb-10">
          <div className="text-xs font-mono tracking-widest uppercase text-muted-foreground mb-3">// Video Checker</div>
          <h1 className="text-5xl md:text-6xl font-display tracking-widest text-foreground mb-4">
            Is This Video <span className="text-primary">Real or Fake?</span>
          </h1>
          <p className="text-lg font-mono text-muted-foreground leading-relaxed max-w-2xl">
            Paste a video link. We'll check if it's real or if it's been faked or manipulated.
          </p>
        </div>

        {/* Input Form */}
        <div className="bg-card border border-border rounded-sm p-6 mb-8 space-y-4">
          <div>
            <label className="text-xs font-mono tracking-widest uppercase text-muted-foreground block mb-2">Video Link *</label>
            <input
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="Paste YouTube or TikTok link..."
              className="w-full bg-background border border-border rounded-sm px-4 py-2.5 text-sm font-mono text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          <div>
            <label className="text-xs font-mono tracking-widest uppercase text-muted-foreground block mb-2">Where Did You See It? (Optional)</label>
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Tell us where you found it and what it claims to show..."
              rows={3}
              className="w-full bg-background border border-border rounded-sm px-4 py-2.5 text-sm font-mono text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary transition-colors resize-none"
            />
          </div>
          <button
            onClick={() => {
              if (!videoUrl.trim()) return toast.error("Paste a video link");
              analyze.mutate({ videoUrl: videoUrl.trim(), context: context.trim() || undefined });
            }}
            disabled={analyze.isPending}
            className="w-full py-3 bg-primary text-primary-foreground font-mono tracking-widest uppercase text-sm disabled:opacity-50 transition-all rounded-sm font-bold hover:bg-primary/90"
          >
            {analyze.isPending ? "Analyzing..." : "Check Video"}
          </button>
        </div>

        {/* Results */}
        {result && verdict && (
          <div className="space-y-4 mb-12">
            <div className={`p-6 rounded-sm border ${verdict.bg} ${verdict.border}`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-xs font-mono text-muted-foreground mb-1">Result</div>
                  <div className={`text-3xl font-display tracking-widest ${verdict.color}`}>{verdict.label}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-mono text-muted-foreground mb-1">Risk Level</div>
                  <div className={`text-3xl font-display ${verdict.color}`}>{result.risk_score}<span className="text-lg">/100</span></div>
                </div>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden mb-3">
                <div
                  className={`h-full rounded-full ${result.risk_score > 60 ? "bg-red-500" : result.risk_score > 30 ? "bg-yellow-500" : "bg-green-500"}`}
                  style={{ width: `${result.risk_score}%` }}
                />
              </div>
              <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground">
                {result.manipulation_type && <span>Type: <span className="text-foreground font-bold">{result.manipulation_type}</span></span>}
                <span>Confidence: <span className={`${result.confidence === "high" ? "text-green-600" : result.confidence === "medium" ? "text-yellow-600" : "text-red-600"}`}>{result.confidence.toUpperCase()}</span></span>
              </div>
            </div>

            <div className="p-5 bg-card border border-border rounded-sm">
              <div className="text-xs font-mono tracking-widest uppercase text-muted-foreground mb-2">What We Found</div>
              <p className="text-sm font-mono text-foreground leading-relaxed">{result.summary}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.context_red_flags.length > 0 && (
                <div className="p-4 bg-card border border-border rounded-sm">
                  <div className="text-xs font-mono tracking-widest uppercase text-red-600 mb-3">Red Flags</div>
                  <ul className="space-y-1.5">{result.context_red_flags.map((f, i) => <li key={i} className="text-xs font-mono text-muted-foreground flex items-start gap-2"><span className="text-red-600 shrink-0">▸</span>{f}</li>)}</ul>
                </div>
              )}
              {result.platform_signals.length > 0 && (
                <div className="p-4 bg-card border border-border rounded-sm">
                  <div className="text-xs font-mono tracking-widest uppercase text-yellow-600 mb-3">Platform Clues</div>
                  <ul className="space-y-1.5">{result.platform_signals.map((s, i) => <li key={i} className="text-xs font-mono text-muted-foreground flex items-start gap-2"><span className="text-yellow-600 shrink-0">▸</span>{s}</li>)}</ul>
                </div>
              )}
              {result.known_techniques.length > 0 && (
                <div className="p-4 bg-card border border-border rounded-sm">
                  <div className="text-xs font-mono tracking-widest uppercase text-orange-600 mb-3">Fake Techniques Used</div>
                  <ul className="space-y-1.5">{result.known_techniques.map((t, i) => <li key={i} className="text-xs font-mono text-muted-foreground flex items-start gap-2"><span className="text-orange-600 shrink-0">▸</span>{t}</li>)}</ul>
                </div>
              )}
              {result.verification_steps.length > 0 && (
                <div className="p-4 bg-green-50 border border-green-300 rounded-sm">
                  <div className="text-xs font-mono tracking-widest uppercase text-green-600 mb-3">How to Check</div>
                  <ol className="space-y-1.5">{result.verification_steps.map((s, i) => <li key={i} className="text-xs font-mono text-foreground flex items-start gap-2"><span className="text-green-600 shrink-0">{i + 1}.</span>{s}</li>)}</ol>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Deepfake Signs */}
        <div>
          <div className="flex items-center gap-4 mb-6">
            <div className="text-xs font-mono tracking-widest uppercase text-muted-foreground">// How to Spot a Deepfake</div>
            <hr className="flex-1 section-divider" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {DEEPFAKE_SIGNS.map((sign) => (
              <div key={sign.title} className="p-4 bg-card border border-border rounded-sm">
                <div className="text-2xl mb-2">{sign.icon}</div>
                <div className="text-sm font-display tracking-wide text-foreground mb-1">{sign.title}</div>
                <p className="text-xs font-mono text-muted-foreground leading-tight">{sign.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

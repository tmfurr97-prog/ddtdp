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
  likely_authentic: { label: "LIKELY AUTHENTIC", color: "text-green-400", bg: "bg-green-950/20", border: "border-green-400/30" },
  needs_verification: { label: "NEEDS VERIFICATION", color: "text-yellow-400", bg: "bg-yellow-950/20", border: "border-yellow-400/30" },
  suspicious: { label: "SUSPICIOUS", color: "text-orange-400", bg: "bg-orange-950/20", border: "border-orange-400/30" },
  likely_fake: { label: "LIKELY FAKE", color: "text-red-400", bg: "bg-red-950/20", border: "border-red-400/30" },
  known_manipulated: { label: "KNOWN MANIPULATED", color: "text-red-400", bg: "bg-red-950/20", border: "border-red-400/30" },
};

const DEEPFAKE_SIGNS = [
  { icon: "👁", title: "Unnatural Eye Movement", desc: "Blinking patterns are off, or eyes don't track naturally" },
  { icon: "💡", title: "Lighting Inconsistencies", desc: "Face lighting doesn't match the background environment" },
  { icon: "🔊", title: "Audio-Visual Mismatch", desc: "Lip sync is slightly off, or voice doesn't match facial movements" },
  { icon: "🌀", title: "Blurry Edges", desc: "Hairline, ears, or jawline appear blurry or unnatural" },
  { icon: "😐", title: "Flat Expressions", desc: "Micro-expressions are missing or look plastic/frozen" },
  { icon: "🎭", title: "Skin Texture Issues", desc: "Skin looks too smooth, waxy, or has artifacts in motion" },
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
          <div className="text-xs font-mono tracking-widest uppercase text-yellow-400 mb-3">// Video Analyzer</div>
          <h1 className="text-5xl md:text-6xl font-display tracking-widest text-foreground mb-4">
            DEEPFAKE &<br />
            <span className="text-yellow-400">AUTHENTICITY CHECK</span>
          </h1>
          <p className="text-muted-foreground font-mono leading-relaxed max-w-2xl">
            Submit a video URL for deepfake risk assessment, manipulation type detection, and step-by-step verification guidance. Our AI analyzes platform signals, context red flags, and known manipulation techniques.
          </p>
        </div>

        {/* Input Form */}
        <div className="bg-card border border-border/50 rounded-sm p-6 mb-8 space-y-4">
          <div>
            <label className="text-xs font-mono tracking-widest uppercase text-muted-foreground block mb-2">Video URL *</label>
            <input
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=... or any video URL"
              className="w-full bg-background border border-border/50 rounded-sm px-4 py-2.5 text-sm font-mono text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-yellow-400/50 transition-colors"
            />
          </div>
          <div>
            <label className="text-xs font-mono tracking-widest uppercase text-muted-foreground block mb-2">Context (Optional)</label>
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Where did you see this? What claims are being made about it? Any additional context helps our analysis..."
              rows={3}
              className="w-full bg-background border border-border/50 rounded-sm px-4 py-2.5 text-sm font-mono text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-yellow-400/50 transition-colors resize-none"
            />
          </div>
          <button
            onClick={() => {
              if (!videoUrl.trim()) return toast.error("Enter a video URL");
              analyze.mutate({ videoUrl: videoUrl.trim(), context: context.trim() || undefined });
            }}
            disabled={analyze.isPending}
            className="w-full py-3 bg-yellow-500/80 hover:bg-yellow-500 text-black font-mono tracking-widest uppercase text-sm disabled:opacity-50 transition-all rounded-sm"
          >
            {analyze.isPending ? "Analyzing video..." : "Analyze Video"}
          </button>
        </div>

        {/* Results */}
        {result && verdict && (
          <div className="space-y-4 mb-12">
            <div className={`p-6 rounded-sm border ${verdict.bg} ${verdict.border}`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-xs font-mono text-muted-foreground mb-1">Verdict</div>
                  <div className={`text-3xl font-display tracking-widest ${verdict.color}`}>{verdict.label}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-mono text-muted-foreground mb-1">Risk Score</div>
                  <div className={`text-3xl font-display ${verdict.color}`}>{result.risk_score}<span className="text-lg">/100</span></div>
                </div>
              </div>
              <div className="h-2 bg-secondary/50 rounded-full overflow-hidden mb-3">
                <div
                  className={`h-full rounded-full ${result.risk_score > 60 ? "bg-red-500" : result.risk_score > 30 ? "bg-yellow-500" : "bg-green-500"}`}
                  style={{ width: `${result.risk_score}%` }}
                />
              </div>
              <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground">
                {result.manipulation_type && <span>Type: <span className="text-foreground">{result.manipulation_type}</span></span>}
                <span>Confidence: <span className={`${result.confidence === "high" ? "text-green-400" : result.confidence === "medium" ? "text-yellow-400" : "text-red-400"}`}>{result.confidence.toUpperCase()}</span></span>
              </div>
            </div>

            <div className="p-5 bg-card border border-border/50 rounded-sm">
              <div className="text-xs font-mono tracking-widest uppercase text-muted-foreground mb-2">Assessment</div>
              <p className="text-sm font-mono text-foreground leading-relaxed">{result.summary}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.context_red_flags.length > 0 && (
                <div className="p-4 bg-card border border-border/50 rounded-sm">
                  <div className="text-xs font-mono tracking-widest uppercase text-red-400 mb-3">Context Red Flags</div>
                  <ul className="space-y-1.5">{result.context_red_flags.map((f, i) => <li key={i} className="text-xs font-mono text-muted-foreground flex items-start gap-2"><span className="text-red-400 shrink-0">▸</span>{f}</li>)}</ul>
                </div>
              )}
              {result.platform_signals.length > 0 && (
                <div className="p-4 bg-card border border-border/50 rounded-sm">
                  <div className="text-xs font-mono tracking-widest uppercase text-yellow-400 mb-3">Platform Signals</div>
                  <ul className="space-y-1.5">{result.platform_signals.map((s, i) => <li key={i} className="text-xs font-mono text-muted-foreground flex items-start gap-2"><span className="text-yellow-400 shrink-0">▸</span>{s}</li>)}</ul>
                </div>
              )}
              {result.known_techniques.length > 0 && (
                <div className="p-4 bg-card border border-border/50 rounded-sm">
                  <div className="text-xs font-mono tracking-widest uppercase text-orange-400 mb-3">Known Techniques</div>
                  <ul className="space-y-1.5">{result.known_techniques.map((t, i) => <li key={i} className="text-xs font-mono text-muted-foreground flex items-start gap-2"><span className="text-orange-400 shrink-0">▸</span>{t}</li>)}</ul>
                </div>
              )}
              {result.verification_steps.length > 0 && (
                <div className="p-4 bg-primary/5 border border-primary/20 rounded-sm">
                  <div className="text-xs font-mono tracking-widest uppercase text-primary mb-3">Verification Steps</div>
                  <ol className="space-y-1.5">{result.verification_steps.map((s, i) => <li key={i} className="text-xs font-mono text-muted-foreground flex items-start gap-2"><span className="text-primary shrink-0">{i + 1}.</span>{s}</li>)}</ol>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Deepfake Signs Guide */}
        <div>
          <div className="flex items-center gap-4 mb-6">
            <div className="text-xs font-mono tracking-widest uppercase text-muted-foreground">// How to Spot a Deepfake</div>
            <hr className="flex-1 section-divider" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {DEEPFAKE_SIGNS.map((sign) => (
              <div key={sign.title} className="p-4 bg-card border border-border/50 rounded-sm">
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

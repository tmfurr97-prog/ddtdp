import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";
import { Link } from "wouter";

type UrlResult = { verdict: string; score: number; flags: string[]; domain_age_note: string; recommendation: string };
type TextResult = { verdict: string; manipulation_tactics: string[]; logical_fallacies: string[]; emotional_triggers: string[]; credibility_score: number; summary: string; recommendation: string };

const EXTERNAL_TOOLS = [
  { name: "Google Reverse Image Search", url: "https://images.google.com", desc: "Find where an image originally appeared online.", icon: "🔍" },
  { name: "TinEye", url: "https://tineye.com", desc: "Reverse image search with date tracking.", icon: "👁" },
  { name: "Snopes", url: "https://snopes.com", desc: "Long-running fact-checking database.", icon: "📚" },
  { name: "PolitiFact", url: "https://politifact.com", desc: "Political claims fact-checking.", icon: "🏛" },
  { name: "FactCheck.org", url: "https://factcheck.org", desc: "Nonpartisan political fact-checking.", icon: "✅" },
  { name: "InVID / WeVerify", url: "https://weverify.eu/verification-plugin/", desc: "Video verification and reverse search.", icon: "🎬" },
  { name: "Wayback Machine", url: "https://web.archive.org", desc: "Check historical versions of websites.", icon: "⏰" },
  { name: "NewsGuard", url: "https://www.newsguardtech.com", desc: "News source credibility ratings.", icon: "🛡" },
];

const verdictColor = (v: string) => {
  if (v === "safe" || v === "credible") return "text-green-400";
  if (v === "suspicious" || v === "questionable") return "text-yellow-400";
  return "text-red-400";
};

const scoreColor = (score: number) => {
  if (score < 30) return "bg-green-500";
  if (score < 60) return "bg-yellow-500";
  return "bg-red-500";
};

export default function VerificationToolkit() {
  const [activeTab, setActiveTab] = useState<"url" | "text">("url");
  const [urlInput, setUrlInput] = useState("");
  const [textInput, setTextInput] = useState("");
  const [urlResult, setUrlResult] = useState<UrlResult | null>(null);
  const [textResult, setTextResult] = useState<TextResult | null>(null);

  const urlMutation = trpc.verifications.analyzeUrl.useMutation({
    onSuccess: (data) => setUrlResult(data as UrlResult),
    onError: (err) => toast.error(err.message),
  });
  const textMutation = trpc.verifications.analyzeText.useMutation({
    onSuccess: (data) => setTextResult(data as TextResult),
    onError: (err) => toast.error(err.message),
  });

  return (
    <div className="min-h-screen py-12">
      <div className="container">
        {/* Header */}
        <div className="mb-12">
          <div className="text-xs font-mono tracking-widest uppercase text-primary mb-3">// Verification Toolkit</div>
          <h1 className="text-5xl md:text-7xl font-display tracking-widest text-foreground mb-4">
            CHECK BEFORE<br />
            <span className="text-primary">YOU WRECK</span>
          </h1>
          <p className="text-muted-foreground font-mono max-w-2xl leading-relaxed">
            AI-powered tools to analyze URLs, scan text for manipulation, detect deepfakes, and identify phishing emails. Your personal misinformation detection kit.
          </p>
        </div>

        {/* AI Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          <Link href="/toolkit/email" className="group p-5 bg-card border border-border/50 hover:border-red-400/40 rounded-sm transition-all no-underline">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-sm bg-red-400/10 border border-red-400/20 flex items-center justify-center text-red-400 text-sm">✉</div>
              <div className="text-xs font-mono tracking-widest uppercase text-red-400">Email Scanner</div>
            </div>
            <h3 className="text-xl font-display tracking-wide text-foreground mb-2 group-hover:text-red-400 transition-colors">
              AI Phishing & Scam Detector
            </h3>
            <p className="text-xs font-mono text-muted-foreground leading-relaxed">
              Paste any suspicious email. Our AI breaks down the scam tactics, urgency manipulation, and what they're really after.
            </p>
          </Link>

          <Link href="/toolkit/video" className="group p-5 bg-card border border-border/50 hover:border-yellow-400/40 rounded-sm transition-all no-underline">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-sm bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center text-yellow-400 text-sm">🎬</div>
              <div className="text-xs font-mono tracking-widest uppercase text-yellow-400">Video Analyzer</div>
            </div>
            <h3 className="text-xl font-display tracking-wide text-foreground mb-2 group-hover:text-yellow-400 transition-colors">
              Deepfake & Authenticity Check
            </h3>
            <p className="text-xs font-mono text-muted-foreground leading-relaxed">
              Submit a video URL for deepfake risk assessment, manipulation type detection, and step-by-step verification guidance.
            </p>
          </Link>
        </div>

        {/* URL + Text Analyzer */}
        <div className="bg-card border border-border/50 rounded-sm mb-12">
          <div className="flex border-b border-border/50">
            <button
              onClick={() => setActiveTab("url")}
              className={`flex-1 px-6 py-4 text-xs font-mono tracking-widest uppercase transition-all ${
                activeTab === "url" ? "text-primary border-b-2 border-primary bg-primary/5" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              URL Analyzer
            </button>
            <button
              onClick={() => setActiveTab("text")}
              className={`flex-1 px-6 py-4 text-xs font-mono tracking-widest uppercase transition-all ${
                activeTab === "text" ? "text-primary border-b-2 border-primary bg-primary/5" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Text Scanner
            </button>
          </div>

          <div className="p-6">
            {activeTab === "url" ? (
              <div>
                <p className="text-xs font-mono text-muted-foreground mb-4">
                  Paste a URL to check its credibility, domain reputation, and misinformation risk.
                </p>
                <div className="flex gap-3">
                  <input
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://suspicious-news-site.com/article..."
                    className="flex-1 bg-background border border-border/50 rounded-sm px-4 py-2.5 text-sm font-mono text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50 transition-colors"
                  />
                  <button
                    onClick={() => {
                      if (!urlInput.trim()) return toast.error("Enter a URL");
                      urlMutation.mutate({ url: urlInput.trim() });
                    }}
                    disabled={urlMutation.isPending}
                    className="px-6 py-2.5 bg-primary text-primary-foreground font-mono tracking-widest uppercase text-xs hover:bg-primary/90 disabled:opacity-50 transition-all rounded-sm whitespace-nowrap"
                  >
                    {urlMutation.isPending ? "Analyzing..." : "Analyze URL"}
                  </button>
                </div>

                {urlResult && (
                  <div className="mt-6 space-y-4">
                    <div className="flex items-center gap-4">
                      <div className={`text-2xl font-display tracking-widest ${verdictColor(urlResult.verdict)}`}>
                        {urlResult.verdict.toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-mono text-muted-foreground">Risk Score</span>
                          <span className="text-xs font-mono text-foreground">{urlResult.score}/100</span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all ${scoreColor(urlResult.score)}`} style={{ width: `${urlResult.score}%` }} />
                        </div>
                      </div>
                    </div>
                    {urlResult.flags.length > 0 && (
                      <div className="p-4 bg-red-950/20 border border-red-400/20 rounded-sm">
                        <div className="text-xs font-mono text-red-400 tracking-widest uppercase mb-2">Red Flags</div>
                        <ul className="space-y-1">
                          {urlResult.flags.map((f, i) => <li key={i} className="text-sm font-mono text-muted-foreground flex items-start gap-2"><span className="text-red-400 mt-0.5">▸</span>{f}</li>)}
                        </ul>
                      </div>
                    )}
                    <div className="p-4 bg-secondary/30 border border-border/30 rounded-sm">
                      <div className="text-xs font-mono text-muted-foreground tracking-widest uppercase mb-1">Domain Note</div>
                      <p className="text-sm font-mono text-foreground">{urlResult.domain_age_note}</p>
                    </div>
                    <div className="p-4 bg-primary/5 border border-primary/20 rounded-sm">
                      <div className="text-xs font-mono text-primary tracking-widest uppercase mb-1">Recommendation</div>
                      <p className="text-sm font-mono text-foreground">{urlResult.recommendation}</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <p className="text-xs font-mono text-muted-foreground mb-4">
                  Paste any text — headline, social post, article excerpt — to detect manipulation tactics and logical fallacies.
                </p>
                <textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Paste the suspicious text here..."
                  rows={5}
                  className="w-full bg-background border border-border/50 rounded-sm px-4 py-2.5 text-sm font-mono text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50 transition-colors resize-none mb-3"
                />
                <button
                  onClick={() => {
                    if (!textInput.trim() || textInput.trim().length < 10) return toast.error("Enter at least 10 characters");
                    textMutation.mutate({ text: textInput.trim() });
                  }}
                  disabled={textMutation.isPending}
                  className="px-6 py-2.5 bg-primary text-primary-foreground font-mono tracking-widest uppercase text-xs hover:bg-primary/90 disabled:opacity-50 transition-all rounded-sm"
                >
                  {textMutation.isPending ? "Scanning..." : "Scan Text"}
                </button>

                {textResult && (
                  <div className="mt-6 space-y-4">
                    <div className="flex items-center gap-4">
                      <div className={`text-2xl font-display tracking-widest ${verdictColor(textResult.verdict)}`}>
                        {textResult.verdict.toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-mono text-muted-foreground">Manipulation Score</span>
                          <span className="text-xs font-mono text-foreground">{textResult.credibility_score}/100</span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all ${scoreColor(textResult.credibility_score)}`} style={{ width: `${textResult.credibility_score}%` }} />
                        </div>
                      </div>
                    </div>
                    <p className="text-sm font-mono text-muted-foreground leading-relaxed">{textResult.summary}</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {textResult.manipulation_tactics.length > 0 && (
                        <div className="p-4 bg-red-950/20 border border-red-400/20 rounded-sm">
                          <div className="text-xs font-mono text-red-400 tracking-widest uppercase mb-2">Manipulation Tactics</div>
                          <ul className="space-y-1">{textResult.manipulation_tactics.map((t, i) => <li key={i} className="text-xs font-mono text-muted-foreground">▸ {t}</li>)}</ul>
                        </div>
                      )}
                      {textResult.logical_fallacies.length > 0 && (
                        <div className="p-4 bg-yellow-950/20 border border-yellow-400/20 rounded-sm">
                          <div className="text-xs font-mono text-yellow-400 tracking-widest uppercase mb-2">Logical Fallacies</div>
                          <ul className="space-y-1">{textResult.logical_fallacies.map((f, i) => <li key={i} className="text-xs font-mono text-muted-foreground">▸ {f}</li>)}</ul>
                        </div>
                      )}
                      {textResult.emotional_triggers.length > 0 && (
                        <div className="p-4 bg-orange-950/20 border border-orange-400/20 rounded-sm">
                          <div className="text-xs font-mono text-orange-400 tracking-widest uppercase mb-2">Emotional Triggers</div>
                          <ul className="space-y-1">{textResult.emotional_triggers.map((e, i) => <li key={i} className="text-xs font-mono text-muted-foreground">▸ {e}</li>)}</ul>
                        </div>
                      )}
                    </div>
                    <div className="p-4 bg-primary/5 border border-primary/20 rounded-sm">
                      <div className="text-xs font-mono text-primary tracking-widest uppercase mb-1">Recommendation</div>
                      <p className="text-sm font-mono text-foreground">{textResult.recommendation}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* External Tools */}
        <div>
          <div className="flex items-center gap-4 mb-6">
            <div className="text-xs font-mono tracking-widest uppercase text-muted-foreground">// External Resources</div>
            <hr className="flex-1 section-divider" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {EXTERNAL_TOOLS.map((tool) => (
              <a
                key={tool.name}
                href={tool.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group p-4 bg-card border border-border/50 hover:border-primary/30 rounded-sm transition-all no-underline"
              >
                <div className="text-2xl mb-2">{tool.icon}</div>
                <div className="text-sm font-display tracking-wide text-foreground mb-1 group-hover:text-primary transition-colors">{tool.name}</div>
                <p className="text-xs font-mono text-muted-foreground leading-tight">{tool.desc}</p>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

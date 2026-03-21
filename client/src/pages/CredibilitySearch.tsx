import { useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Search, CheckCircle, AlertCircle, HelpCircle, XCircle } from "lucide-react";

type SearchResult = {
  verdict: string;
  credibilityScore: number;
  summary: string;
  sources: string[];
  fullAnalysis: string;
};

const VERDICT_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  true: { label: "TRUE", color: "text-green-500", bg: "bg-green-50", icon: <CheckCircle className="w-8 h-8" /> },
  false: { label: "FALSE", color: "text-red-500", bg: "bg-red-50", icon: <XCircle className="w-8 h-8" /> },
  misleading: { label: "MISLEADING", color: "text-yellow-500", bg: "bg-yellow-50", icon: <AlertCircle className="w-8 h-8" /> },
  unverified: { label: "UNVERIFIED", color: "text-gray-500", bg: "bg-gray-50", icon: <HelpCircle className="w-8 h-8" /> },
};

export default function CredibilitySearch() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<SearchResult | null>(null);
  const [searchHistory, setSearchHistory] = useState<SearchResult[]>([]);

  const search = trpc.credibilitySearch.search.useMutation({
    onSuccess: (data) => {
      setResult(data);
      setSearchHistory((prev) => [data, ...prev.slice(0, 9)]);
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSearch = () => {
    if (!query.trim() || query.trim().length < 3) {
      toast.error("Enter a claim to fact-check (at least 3 characters)");
      return;
    }
    search.mutate({ query: query.trim() });
  };

  const verdict = result ? VERDICT_CONFIG[result.verdict] ?? VERDICT_CONFIG.unverified : null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="border-b border-border/30 bg-background/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-mono font-bold tracking-widest uppercase text-foreground">
            Credibility Check
          </h1>
          <p className="text-sm text-muted-foreground mt-2 font-mono">
            Ask us anything. We'll fact-check it and tell you if it's true or not.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Search Box */}
        <div className="mb-12">
          <div className="flex gap-3">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Did Chuck Norris die? Is the earth flat? Did NASA fake the moon landing?"
              className="flex-1 bg-background border border-border/50 rounded-sm px-4 py-3 text-sm font-mono text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-accent/50 transition-colors"
            />
            <button
              onClick={handleSearch}
              disabled={search.isPending}
              className="px-6 py-3 bg-accent text-accent-foreground font-mono tracking-widest uppercase text-sm hover:bg-accent/90 disabled:opacity-50 transition-all rounded-sm flex items-center gap-2"
            >
              {search.isPending ? "Checking..." : "Check"}
              <Search className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Result */}
        {result && verdict && (
          <div className="space-y-6 mb-12">
            {/* Verdict Card */}
            <div className={`p-8 rounded-sm border-2 border-border/30 ${verdict.bg}`}>
              <div className="flex items-start gap-6">
                <div className={verdict.color}>{verdict.icon}</div>
                <div className="flex-1">
                  <div className="text-xs font-mono text-muted-foreground mb-2 uppercase tracking-widest">Verdict</div>
                  <h2 className={`text-4xl font-mono font-bold mb-4 ${verdict.color}`}>{verdict.label}</h2>
                  <p className="text-foreground/80 leading-relaxed mb-4">{result.summary}</p>
                  <div className="flex items-center gap-3">
                    <div className="text-xs font-mono text-muted-foreground">Credibility Score</div>
                    <div className="flex-1 bg-background rounded-sm h-2 overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          result.credibilityScore >= 70
                            ? "bg-green-500"
                            : result.credibilityScore >= 40
                              ? "bg-yellow-500"
                              : "bg-red-500"
                        }`}
                        style={{ width: `${result.credibilityScore}%` }}
                      />
                    </div>
                    <div className="text-sm font-mono font-bold w-12 text-right">{result.credibilityScore}%</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Full Analysis */}
            <div className="bg-card border border-border/50 rounded-sm p-6">
              <h3 className="text-xs font-mono tracking-widest uppercase text-muted-foreground mb-4">Full Analysis</h3>
              <p className="text-foreground/80 leading-relaxed whitespace-pre-wrap">{result.fullAnalysis}</p>
            </div>

            {/* Sources */}
            {result.sources && result.sources.length > 0 && (
              <div className="bg-card border border-border/50 rounded-sm p-6">
                <h3 className="text-xs font-mono tracking-widest uppercase text-muted-foreground mb-4">Sources</h3>
                <ul className="space-y-2">
                  {result.sources.map((source, idx) => (
                    <li key={idx} className="text-sm text-accent hover:text-accent/80 break-all">
                      • {source}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Search History */}
        {searchHistory.length > 0 && (
          <div>
            <h3 className="text-xs font-mono tracking-widest uppercase text-muted-foreground mb-4">Recent Searches</h3>
            <div className="space-y-3">
              {searchHistory.map((item, idx) => {
                const config = VERDICT_CONFIG[item.verdict] ?? VERDICT_CONFIG.unverified;
                return (
                  <div
                    key={idx}
                    className="p-4 bg-card border border-border/30 rounded-sm hover:border-border/60 transition-all cursor-pointer"
                    onClick={() => setResult(item)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-sm font-mono text-foreground mb-2">Recent search</p>
                        <p className="text-foreground/80">{item.summary}</p>
                      </div>
                      <div className={`text-xs font-mono font-bold px-3 py-1 rounded-sm ${config.color} ${config.bg}`}>
                        {config.label}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!result && searchHistory.length === 0 && (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
            <p className="text-muted-foreground font-mono">Start by asking a question above</p>
          </div>
        )}
      </div>
    </div>
  );
}

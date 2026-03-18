import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";

type EmailResult = {
  verdict: string;
  risk_score: number;
  scam_type: string;
  red_flags: string[];
  urgency_tactics: string[];
  suspicious_links: string[];
  sender_red_flags: string[];
  what_they_want: string;
  summary: string;
  what_to_do: string;
};

const VERDICT_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  safe: { label: "SAFE", color: "text-green-600", bg: "bg-green-50", border: "border-green-300" },
  suspicious: { label: "SUSPICIOUS", color: "text-yellow-600", bg: "bg-yellow-50", border: "border-yellow-300" },
  scam: { label: "SCAM", color: "text-red-600", bg: "bg-red-50", border: "border-red-300" },
  phishing: { label: "PHISHING", color: "text-red-600", bg: "bg-red-50", border: "border-red-300" },
  dangerous: { label: "DANGEROUS", color: "text-red-600", bg: "bg-red-50", border: "border-red-300" },
};

const EXAMPLE_EMAILS = [
  {
    label: "Fake Prize",
    text: `From: prizes@lottery-winner-2024.net\nSubject: YOU WON $50,000!!!\n\nHi,\n\nYou won! Send $299 to claim your prize. You have 24 hours or you lose it.\n\nClick here: http://lottery-claim-now.xyz`,
  },
  {
    label: "Fake Bank",
    text: `From: security@bankofamerica-alerts.net\nSubject: Your account is locked!\n\nYour account has been locked. Click here to unlock it and verify your password.\n\nhttp://secure-bankofamerica-verify.com`,
  },
];

export default function EmailScanner() {
  const [emailText, setEmailText] = useState("");
  const [result, setResult] = useState<EmailResult | null>(null);

  const scan = trpc.verifications.scanEmail.useMutation({
    onSuccess: (data) => setResult(data as EmailResult),
    onError: (err) => toast.error(err.message),
  });

  const verdict = result ? VERDICT_CONFIG[result.verdict] ?? VERDICT_CONFIG.suspicious : null;

  return (
    <div className="min-h-screen py-12">
      <div className="container max-w-4xl">
        {/* Header */}
        <div className="mb-10">
          <div className="text-xs font-mono tracking-widest uppercase text-muted-foreground mb-3">// Email Checker</div>
          <h1 className="text-5xl md:text-6xl font-display tracking-widest text-foreground mb-4">
            Is This Email <span className="text-primary">a Scam?</span>
          </h1>
          <p className="text-lg font-mono text-muted-foreground leading-relaxed max-w-2xl">
            Paste an email below. We'll tell you if it's real or fake, and explain what the scammer is trying to do.
          </p>
        </div>

        {/* Examples */}
        <div className="mb-6">
          <div className="text-xs font-mono text-muted-foreground mb-3">Try an example:</div>
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_EMAILS.map((ex) => (
              <button
                key={ex.label}
                onClick={() => setEmailText(ex.text)}
                className="px-3 py-1.5 text-xs font-mono border border-border text-muted-foreground hover:border-primary hover:text-foreground rounded-sm transition-all"
              >
                {ex.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="bg-card border border-border rounded-sm mb-6">
          <div className="px-4 py-2 border-b border-border flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-400" />
            <div className="w-2 h-2 rounded-full bg-yellow-400" />
            <div className="w-2 h-2 rounded-full bg-green-400" />
            <span className="text-xs font-mono text-muted-foreground ml-2">email.txt</span>
          </div>
          <textarea
            value={emailText}
            onChange={(e) => setEmailText(e.target.value)}
            placeholder="Paste the full email here..."
            rows={10}
            className="w-full bg-background px-4 py-3 text-sm font-mono text-foreground placeholder:text-muted-foreground/40 focus:outline-none resize-none"
          />
        </div>

        <button
          onClick={() => {
            if (!emailText.trim() || emailText.trim().length < 20) return toast.error("Paste the full email");
            scan.mutate({ emailText: emailText.trim() });
          }}
          disabled={scan.isPending}
          className="w-full py-3 bg-primary text-primary-foreground font-mono tracking-widest uppercase text-sm disabled:opacity-50 transition-all rounded-sm mb-10 font-bold hover:bg-primary/90"
        >
          {scan.isPending ? "Checking..." : "Check Email"}
        </button>

        {/* Results */}
        {result && verdict && (
          <div className="space-y-4">
            {/* Verdict */}
            <div className={`p-6 rounded-sm border ${verdict.bg} ${verdict.border}`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-xs font-mono text-muted-foreground mb-1">Result</div>
                  <div className={`text-4xl font-display tracking-widest ${verdict.color}`}>{verdict.label}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-mono text-muted-foreground mb-1">Risk Level</div>
                  <div className={`text-4xl font-display ${verdict.color}`}>{result.risk_score}<span className="text-xl">/100</span></div>
                </div>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden mb-4">
                <div
                  className={`h-full rounded-full transition-all ${result.risk_score > 60 ? "bg-red-500" : result.risk_score > 30 ? "bg-yellow-500" : "bg-green-500"}`}
                  style={{ width: `${result.risk_score}%` }}
                />
              </div>
              {result.scam_type && (
                <div className="text-xs font-mono text-muted-foreground">Type: <span className="text-foreground font-bold">{result.scam_type}</span></div>
              )}
            </div>

            {/* Summary */}
            <div className="p-5 bg-card border border-border rounded-sm">
              <div className="text-xs font-mono tracking-widest uppercase text-muted-foreground mb-2">What We Found</div>
              <p className="text-sm font-mono text-foreground leading-relaxed">{result.summary}</p>
            </div>

            {/* What They Want */}
            {result.what_they_want && (
              <div className="p-5 bg-red-50 border border-red-300 rounded-sm">
                <div className="text-xs font-mono tracking-widest uppercase text-red-600 mb-2">What They're Trying to Get</div>
                <p className="text-sm font-mono text-foreground">{result.what_they_want}</p>
              </div>
            )}

            {/* Flags */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.red_flags.length > 0 && (
                <div className="p-4 bg-card border border-border rounded-sm">
                  <div className="text-xs font-mono tracking-widest uppercase text-red-600 mb-3">Red Flags</div>
                  <ul className="space-y-1.5">
                    {result.red_flags.map((f, i) => <li key={i} className="text-xs font-mono text-muted-foreground flex items-start gap-2"><span className="text-red-600 mt-0.5 shrink-0">▸</span>{f}</li>)}
                  </ul>
                </div>
              )}
              {result.urgency_tactics.length > 0 && (
                <div className="p-4 bg-card border border-border rounded-sm">
                  <div className="text-xs font-mono tracking-widest uppercase text-yellow-600 mb-3">Urgency Tricks</div>
                  <ul className="space-y-1.5">
                    {result.urgency_tactics.map((t, i) => <li key={i} className="text-xs font-mono text-muted-foreground flex items-start gap-2"><span className="text-yellow-600 mt-0.5 shrink-0">▸</span>{t}</li>)}
                  </ul>
                </div>
              )}
              {result.sender_red_flags.length > 0 && (
                <div className="p-4 bg-card border border-border rounded-sm">
                  <div className="text-xs font-mono tracking-widest uppercase text-orange-600 mb-3">Sender Problems</div>
                  <ul className="space-y-1.5">
                    {result.sender_red_flags.map((f, i) => <li key={i} className="text-xs font-mono text-muted-foreground flex items-start gap-2"><span className="text-orange-600 mt-0.5 shrink-0">▸</span>{f}</li>)}
                  </ul>
                </div>
              )}
              {result.suspicious_links.length > 0 && (
                <div className="p-4 bg-card border border-border rounded-sm">
                  <div className="text-xs font-mono tracking-widest uppercase text-purple-600 mb-3">Fake Links</div>
                  <ul className="space-y-1.5">
                    {result.suspicious_links.map((l, i) => <li key={i} className="text-xs font-mono text-muted-foreground break-all flex items-start gap-2"><span className="text-purple-600 mt-0.5 shrink-0">▸</span>{l}</li>)}
                  </ul>
                </div>
              )}
            </div>

            {/* What To Do */}
            <div className="p-5 bg-green-50 border border-green-300 rounded-sm">
              <div className="text-xs font-mono tracking-widest uppercase text-green-600 mb-2">What You Should Do</div>
              <p className="text-sm font-mono text-foreground leading-relaxed">{result.what_to_do}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

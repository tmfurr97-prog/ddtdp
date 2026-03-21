import { useState } from "react";
import { toast } from "sonner";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { AlertTriangle } from "lucide-react";

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
  safe: { label: "SAFE", color: "text-green-400", bg: "bg-green-950/20", border: "border-green-400/30" },
  suspicious: { label: "SUSPICIOUS", color: "text-yellow-400", bg: "bg-yellow-950/20", border: "border-yellow-400/30" },
  scam: { label: "SCAM", color: "text-red-400", bg: "bg-red-950/20", border: "border-red-400/30" },
  phishing: { label: "PHISHING", color: "text-red-400", bg: "bg-red-950/20", border: "border-red-400/30" },
  dangerous: { label: "DANGEROUS", color: "text-red-400", bg: "bg-red-950/20", border: "border-red-400/30" },
};

const EXAMPLE_EMAILS = [
  {
    label: "Fake Prize Notification",
    text: `From: prizes@lottery-winner-2024.net\nSubject: URGENT: You've won $50,000! Claim within 24 hours!\n\nDear Lucky Winner,\n\nCongratulations! Your email was randomly selected in our international lottery draw. You have won the sum of $50,000 USD.\n\nTo claim your prize, you must respond within 24 HOURS or the prize will be forfeited. Send your full name, address, phone number, and a processing fee of $299 to secure your winnings.\n\nClick here to claim: http://lottery-claim-now.xyz/claim\n\nDo not ignore this message. Time is running out!`,
  },
  {
    label: "Bank Account Alert",
    text: `From: security@bankofamerica-alerts.net\nSubject: ⚠️ Your account has been compromised - Immediate action required\n\nDear Valued Customer,\n\nWe have detected suspicious activity on your account. Your account has been temporarily limited.\n\nTo restore full access, please verify your identity immediately by clicking the link below:\n\nhttp://secure-bankofamerica-verify.com/login\n\nFailure to verify within 2 hours will result in permanent account suspension.\n\nBank of America Security Team`,
  },
];

export default function EmailScanner() {
  const [emailText, setEmailText] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [result, setResult] = useState<EmailResult | null>(null);

  const scan = trpc.verifications.scanEmail.useMutation({
    onSuccess: (data) => setResult(data as EmailResult),
    onError: (err) => toast.error(err.message),
  });

  const checkScamSender = trpc.scamSender.check.useQuery(
    { email: senderEmail },
    { enabled: senderEmail.length > 5 && senderEmail.includes("@") }
  );

  const reportSender = trpc.scamSender.report.useMutation({
    onSuccess: () => toast.success("Sender reported. Thanks for helping keep others safe!"),
    onError: (err) => toast.error(err.message),
  });

  const verdict = result ? VERDICT_CONFIG[result.verdict] ?? VERDICT_CONFIG.suspicious : null;

  return (
    <div className="min-h-screen py-12">
      <div className="container max-w-4xl">
        {/* Header */}
        <div className="mb-10">
          <div className="text-xs font-mono tracking-widest uppercase text-red-400 mb-3">// Email Scanner</div>
          <h1 className="text-5xl md:text-6xl font-display tracking-widest text-foreground mb-4">
            PHISHING &<br />
            <span className="text-red-400">SCAM DETECTOR</span>
          </h1>
          <p className="text-muted-foreground font-mono leading-relaxed max-w-2xl">
            Paste any suspicious email below. Our AI will break down the scam tactics, urgency manipulation, what they're really after, and exactly what you should do.
          </p>
        </div>

        {/* Example Emails */}
        <div className="mb-6">
          <div className="text-xs font-mono text-muted-foreground mb-3">// Try an example:</div>
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_EMAILS.map((ex) => (
              <button
                key={ex.label}
                onClick={() => setEmailText(ex.text)}
                className="px-3 py-1.5 text-xs font-mono border border-border/50 text-muted-foreground hover:border-red-400/30 hover:text-foreground rounded-sm transition-all"
              >
                {ex.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sender Email */}
        <div className="mb-6">
          <label className="text-xs font-mono tracking-widest uppercase text-muted-foreground mb-2 block">
            Sender Email Address
          </label>
          <input
            type="email"
            value={senderEmail}
            onChange={(e) => setSenderEmail(e.target.value)}
            placeholder="example@suspicious-domain.com"
            className="w-full bg-card border border-border/50 rounded-sm px-4 py-2 text-sm font-mono text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-red-400/50 transition-colors"
          />
          {checkScamSender.data && (
            <div className="mt-3 p-3 bg-red-950/30 border border-red-400/30 rounded-sm flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
              <div>
                <div className="text-xs font-mono text-red-400 mb-1">FLAGGED SENDER</div>
                <p className="text-sm text-red-300/80 mb-1">
                  This sender has been reported {checkScamSender.data.reportCount} times
                </p>
                <p className="text-xs text-red-300/60">
                  Type: {checkScamSender.data.scamType || "Unknown"} | Severity: {checkScamSender.data.severity}
                </p>
                {checkScamSender.data.description && (
                  <p className="text-xs text-red-300/60 mt-1">{checkScamSender.data.description}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="bg-card border border-border/50 rounded-sm mb-6">
          <div className="px-4 py-2 border-b border-border/30 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-400/60" />
            <div className="w-2 h-2 rounded-full bg-yellow-400/60" />
            <div className="w-2 h-2 rounded-full bg-green-400/60" />
            <span className="text-xs font-mono text-muted-foreground ml-2">email_content.txt</span>
          </div>
          <textarea
            value={emailText}
            onChange={(e) => setEmailText(e.target.value)}
            placeholder="Paste the full email here — including headers, subject line, and body..."
            rows={10}
            className="w-full bg-transparent px-4 py-3 text-sm font-mono text-foreground placeholder:text-muted-foreground/40 focus:outline-none resize-none"
          />
        </div>

        <div className="flex gap-3 mb-10">
          <button
            onClick={() => {
              if (!emailText.trim() || emailText.trim().length < 20) return toast.error("Paste the full email content");
              scan.mutate({ emailText: emailText.trim() });
            }}
            disabled={scan.isPending}
            className="flex-1 py-3 bg-red-500/80 hover:bg-red-500 text-white font-mono tracking-widest uppercase text-sm disabled:opacity-50 transition-all rounded-sm"
          >
            {scan.isPending ? "Scanning for threats..." : "Scan Email"}
          </button>
          <Link href="/toolkit/email/forward">
            <button className="px-6 py-3 border border-red-400/50 text-red-400 font-mono tracking-widest uppercase text-sm hover:bg-red-400/10 transition-all rounded-sm">
              Forward to Us
            </button>
          </Link>
        </div>

        {/* Results */}
        {result && verdict && (
          <div className="space-y-4">
            {/* Verdict Header */}
            <div className={`p-6 rounded-sm border ${verdict.bg} ${verdict.border}`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-xs font-mono text-muted-foreground mb-1">Verdict</div>
                  <div className={`text-4xl font-display tracking-widest ${verdict.color}`}>{verdict.label}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-mono text-muted-foreground mb-1">Risk Score</div>
                  <div className={`text-4xl font-display ${verdict.color}`}>
                    {result.risk_score}<span className="text-xl">/100</span>
                  </div>
                </div>
              </div>
              <div className="h-2 bg-secondary/50 rounded-full overflow-hidden mb-4">
                <div
                  className={`h-full rounded-full transition-all ${
                    result.risk_score > 60 ? "bg-red-500" : result.risk_score > 30 ? "bg-yellow-500" : "bg-green-500"
                  }`}
                  style={{ width: `${result.risk_score}%` }}
                />
              </div>
              {result.scam_type && (
                <div className="text-xs font-mono text-muted-foreground">
                  Scam Type: <span className="text-foreground">{result.scam_type}</span>
                </div>
              )}
            </div>

            {/* Report Sender Button */}
            {senderEmail && (
              <button
                onClick={() =>
                  reportSender.mutate({
                    email: senderEmail,
                    scamType: result.scam_type,
                    severity: result.risk_score > 70 ? "critical" : result.risk_score > 50 ? "high" : "medium",
                    description: result.summary,
                  })
                }
                disabled={reportSender.isPending}
                className="w-full py-2 border border-red-400/50 text-red-400 font-mono tracking-widest uppercase text-xs hover:bg-red-400/10 disabled:opacity-50 transition-all rounded-sm"
              >
                {reportSender.isPending ? "Reporting..." : "Report This Sender"}
              </button>
            )}

            {/* Summary */}
            <div className="p-5 bg-card border border-border/50 rounded-sm">
              <div className="text-xs font-mono tracking-widest uppercase text-muted-foreground mb-2">Analysis</div>
              <p className="text-sm font-mono text-foreground leading-relaxed">{result.summary}</p>
            </div>

            {/* What They Want */}
            {result.what_they_want && (
              <div className="p-5 bg-red-950/10 border border-red-400/20 rounded-sm">
                <div className="text-xs font-mono tracking-widest uppercase text-red-400 mb-2">What They're After</div>
                <p className="text-sm font-mono text-foreground">{result.what_they_want}</p>
              </div>
            )}

            {/* Flags Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.red_flags.length > 0 && (
                <div className="p-4 bg-card border border-border/50 rounded-sm">
                  <div className="text-xs font-mono tracking-widest uppercase text-red-400 mb-3">Red Flags</div>
                  <ul className="space-y-1.5">
                    {result.red_flags.map((f, i) => (
                      <li key={i} className="text-xs font-mono text-muted-foreground flex items-start gap-2">
                        <span className="text-red-400 mt-0.5 shrink-0">▸</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {result.urgency_tactics.length > 0 && (
                <div className="p-4 bg-card border border-border/50 rounded-sm">
                  <div className="text-xs font-mono tracking-widest uppercase text-yellow-400 mb-3">Urgency Tactics</div>
                  <ul className="space-y-1.5">
                    {result.urgency_tactics.map((t, i) => (
                      <li key={i} className="text-xs font-mono text-muted-foreground flex items-start gap-2">
                        <span className="text-yellow-400 mt-0.5 shrink-0">▸</span>
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {result.sender_red_flags.length > 0 && (
                <div className="p-4 bg-card border border-border/50 rounded-sm">
                  <div className="text-xs font-mono tracking-widest uppercase text-orange-400 mb-3">Sender Red Flags</div>
                  <ul className="space-y-1.5">
                    {result.sender_red_flags.map((f, i) => (
                      <li key={i} className="text-xs font-mono text-muted-foreground flex items-start gap-2">
                        <span className="text-orange-400 mt-0.5 shrink-0">▸</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {result.suspicious_links.length > 0 && (
                <div className="p-4 bg-card border border-border/50 rounded-sm">
                  <div className="text-xs font-mono tracking-widest uppercase text-purple-400 mb-3">Suspicious Links</div>
                  <ul className="space-y-1.5">
                    {result.suspicious_links.map((l, i) => (
                      <li key={i} className="text-xs font-mono text-muted-foreground break-all flex items-start gap-2">
                        <span className="text-purple-400 mt-0.5 shrink-0">▸</span>
                        {l}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* What To Do */}
            <div className="p-5 bg-primary/5 border border-primary/20 rounded-sm">
              <div className="text-xs font-mono tracking-widest uppercase text-primary mb-2">What To Do</div>
              <p className="text-sm font-mono text-foreground leading-relaxed">{result.what_to_do}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

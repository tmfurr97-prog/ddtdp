import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";

const PRESET_AMOUNTS = [500, 1000, 2500, 5000, 10000];

const IMPACT_ITEMS = [
  { amount: "$5", impact: "Covers the AI analysis cost for 50 verification scans" },
  { amount: "$10", impact: "Funds one new training module for the community" },
  { amount: "$25", impact: "Supports a week of server costs keeping the tools free" },
  { amount: "$50", impact: "Sponsors one community member's premium access for a year" },
  { amount: "$100", impact: "Funds a media literacy workshop for a local school" },
];

export default function Donate() {
  const { isAuthenticated } = useAuth();
  const [amount, setAmount] = useState(1000);
  const [customAmount, setCustomAmount] = useState("");
  const [type, setType] = useState<"one_time" | "recurring">("one_time");
  const [message, setMessage] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [donated, setDonated] = useState(false);

  const donate = trpc.donations.donate.useMutation({
    onSuccess: () => {
      toast.success("Thank you! Your support means everything to this mission.");
      setDonated(true);
    },
    onError: (err) => toast.error(err.message),
  });

  const finalAmount = customAmount ? Math.round(parseFloat(customAmount) * 100) : amount;

  if (donated) {
    return (
      <div className="min-h-screen py-12 flex items-center justify-center">
        <div className="text-center max-w-lg">
          <div className="text-6xl mb-6">🙏</div>
          <h1 className="text-5xl font-display tracking-widest text-foreground mb-4">THANK YOU</h1>
          <p className="text-muted-foreground font-mono leading-relaxed mb-8">
            Your support keeps the tools free, the training accessible, and the mission alive. You're part of the solution.
          </p>
          <div className="text-xs font-mono text-muted-foreground p-4 bg-card border border-border/50 rounded-sm">
            Payment processing integration coming soon. Your donation intent has been recorded.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container max-w-4xl">
        {/* Header */}
        <div className="mb-12">
          <div className="text-xs font-mono tracking-widest uppercase text-accent mb-3">// Support the Mission</div>
          <h1 className="text-5xl md:text-7xl font-display tracking-widest text-foreground mb-4">
            FUND THE<br />
            <span className="text-accent">ANTIDOTE</span>
          </h1>
          <p className="text-muted-foreground font-mono max-w-2xl leading-relaxed">
            DDTDP is built on the belief that media literacy should be free and accessible to everyone. Your support keeps the tools running, the training free, and the mission alive.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Donation Form */}
          <div>
            {/* Type Toggle */}
            <div className="flex bg-card border border-border/50 rounded-sm overflow-hidden mb-6">
              <button
                onClick={() => setType("one_time")}
                className={`flex-1 px-4 py-2.5 text-xs font-mono tracking-widest uppercase transition-all ${type === "one_time" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                One Time
              </button>
              <button
                onClick={() => setType("recurring")}
                className={`flex-1 px-4 py-2.5 text-xs font-mono tracking-widest uppercase transition-all ${type === "recurring" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                Monthly
              </button>
            </div>

            {/* Amount Presets */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {PRESET_AMOUNTS.map((preset) => (
                <button
                  key={preset}
                  onClick={() => { setAmount(preset); setCustomAmount(""); }}
                  className={`py-2.5 text-sm font-mono rounded-sm transition-all ${
                    amount === preset && !customAmount
                      ? "bg-accent text-accent-foreground"
                      : "bg-card border border-border/50 text-muted-foreground hover:border-accent/30 hover:text-foreground"
                  }`}
                >
                  ${(preset / 100).toFixed(0)}
                </button>
              ))}
              <button
                onClick={() => setAmount(0)}
                className={`py-2.5 text-sm font-mono rounded-sm transition-all ${
                  customAmount ? "bg-accent text-accent-foreground" : "bg-card border border-border/50 text-muted-foreground hover:border-accent/30 hover:text-foreground"
                }`}
              >
                Custom
              </button>
            </div>

            {/* Custom Amount */}
            <div className="relative mb-4">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-mono text-sm">$</span>
              <input
                value={customAmount}
                onChange={(e) => { setCustomAmount(e.target.value); setAmount(0); }}
                placeholder="Enter custom amount"
                type="number"
                min="1"
                className="w-full bg-background border border-border/50 rounded-sm pl-8 pr-4 py-2.5 text-sm font-mono text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-accent/50 transition-colors"
              />
            </div>

            {/* Message */}
            <div className="mb-4">
              <label className="text-xs font-mono tracking-widest uppercase text-muted-foreground block mb-2">Message (optional)</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Leave a message of support..."
                rows={3}
                className="w-full bg-background border border-border/50 rounded-sm px-4 py-2.5 text-sm font-mono text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-accent/50 transition-colors resize-none"
              />
            </div>

            {/* Anonymous Toggle */}
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={() => setAnonymous(!anonymous)}
                className={`w-10 h-5 rounded-full transition-all relative ${anonymous ? "bg-accent" : "bg-secondary"}`}
              >
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${anonymous ? "left-5" : "left-0.5"}`} />
              </button>
              <span className="text-xs font-mono text-muted-foreground">Donate anonymously</span>
            </div>

            <button
              onClick={() => {
                const amt = customAmount ? Math.round(parseFloat(customAmount) * 100) : amount;
                if (!amt || amt < 100) return toast.error("Minimum donation is $1");
                donate.mutate({ amount: amt, type, message: message || undefined, anonymous });
              }}
              disabled={donate.isPending}
              className="w-full py-3 bg-accent text-accent-foreground font-mono tracking-widest uppercase text-sm hover:bg-accent/90 disabled:opacity-50 transition-all rounded-sm"
            >
              {donate.isPending ? "Processing..." : `Donate ${customAmount ? `$${customAmount}` : `$${(amount / 100).toFixed(0)}`} ${type === "recurring" ? "/month" : ""}`}
            </button>

            <p className="text-xs font-mono text-muted-foreground/50 mt-3 text-center">
              Secure payment processing coming soon. This records your donation intent.
            </p>
          </div>

          {/* Impact */}
          <div>
            <div className="text-xs font-mono tracking-widest uppercase text-muted-foreground mb-4">// Your Impact</div>
            <div className="space-y-3">
              {IMPACT_ITEMS.map((item) => (
                <div key={item.amount} className="flex items-start gap-4 p-4 bg-card border border-border/50 rounded-sm">
                  <div className="text-lg font-display text-accent shrink-0 w-12">{item.amount}</div>
                  <p className="text-xs font-mono text-muted-foreground leading-relaxed">{item.impact}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 p-5 bg-card border border-accent/20 rounded-sm">
              <div className="text-xs font-mono tracking-widest uppercase text-accent mb-3">// Where Your Money Goes</div>
              <div className="space-y-2">
                {[
                  { label: "AI Tool Infrastructure", pct: 40 },
                  { label: "Content & Research", pct: 30 },
                  { label: "Media Literacy Programs", pct: 20 },
                  { label: "Operations", pct: 10 },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-mono text-muted-foreground">{item.label}</span>
                      <span className="text-xs font-mono text-foreground">{item.pct}%</span>
                    </div>
                    <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-accent/60 rounded-full" style={{ width: `${item.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

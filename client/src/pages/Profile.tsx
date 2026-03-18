import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";

const TOOL_LABELS: Record<string, string> = {
  url_analyzer: "URL Analyzer",
  text_analyzer: "Text Scanner",
  email_scan: "Email Scanner",
  video_analyzer: "Video Analyzer",
};

const VERDICT_COLORS: Record<string, string> = {
  safe: "text-green-400",
  credible: "text-green-400",
  likely_authentic: "text-green-400",
  suspicious: "text-yellow-400",
  questionable: "text-yellow-400",
  needs_verification: "text-yellow-400",
  false: "text-red-400",
  manipulative: "text-red-400",
  scam: "text-red-400",
  phishing: "text-red-400",
  dangerous: "text-red-400",
  likely_fake: "text-red-400",
  known_manipulated: "text-red-400",
};

export default function Profile() {
  const { isAuthenticated, user, logout } = useAuth();
  const { data: membership } = trpc.memberships.myMembership.useQuery(undefined, { enabled: isAuthenticated });
  const { data: verifications } = trpc.verifications.myHistory.useQuery({ limit: 20 }, { enabled: isAuthenticated });
  const { data: mySubmissions } = trpc.submissions.mySubmissions.useQuery(undefined, { enabled: isAuthenticated });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-3xl font-display tracking-widest text-foreground mb-4">SIGN IN REQUIRED</h2>
          <p className="text-muted-foreground font-mono mb-6">Create an account to track your verifications and access premium features.</p>
          <a href={getLoginUrl()} className="px-6 py-2.5 bg-primary text-primary-foreground font-mono tracking-widest uppercase text-xs hover:bg-primary/90 transition-all rounded-sm no-underline">
            Sign In
          </a>
        </div>
      </div>
    );
  }

  const isPremium = membership?.tier === "premium" && membership?.status === "active";

  return (
    <div className="min-h-screen py-12">
      <div className="container max-w-4xl">
        {/* Header */}
        <div className="flex items-start justify-between mb-10">
          <div>
            <div className="text-xs font-mono tracking-widest uppercase text-muted-foreground mb-2">// Your Profile</div>
            <h1 className="text-4xl font-display tracking-widest text-foreground mb-1">
              {user?.name ?? "Anonymous"}
            </h1>
            {user?.email && (
              <div className="text-sm font-mono text-muted-foreground">{user.email}</div>
            )}
          </div>
          <div className="flex items-center gap-3">
            {isPremium ? (
              <div className="text-xs font-mono text-primary border border-primary/30 px-3 py-1.5 rounded-sm badge-platinum">
                ✦ Premium Member
              </div>
            ) : (
              <Link href="/premium" className="text-xs font-mono text-muted-foreground border border-border/50 px-3 py-1.5 rounded-sm hover:border-primary/30 hover:text-primary transition-all no-underline">
                Upgrade to Premium
              </Link>
            )}
            <button
              onClick={logout}
              className="text-xs font-mono text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: "Verifications Run", value: verifications?.length ?? 0 },
            { label: "Tips Submitted", value: mySubmissions?.length ?? 0 },
            { label: "Membership", value: isPremium ? "Premium" : "Free" },
            { label: "Member Since", value: user?.createdAt ? new Date(user.createdAt).getFullYear().toString() : "2025" },
          ].map((stat) => (
            <div key={stat.label} className="p-4 bg-card border border-border/50 rounded-sm text-center">
              <div className="text-2xl font-display text-primary mb-1">{stat.value}</div>
              <div className="text-xs font-mono text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Verification History */}
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-5">
            <div className="text-xs font-mono tracking-widest uppercase text-muted-foreground">// Verification History</div>
            <hr className="flex-1 section-divider" />
          </div>
          {verifications && verifications.length > 0 ? (
            <div className="space-y-2">
              {verifications.map((v) => (
                <div key={v.id} className="flex items-center justify-between p-4 bg-card border border-border/50 rounded-sm">
                  <div className="flex items-center gap-4 min-w-0">
                    <span className="text-xs font-mono text-muted-foreground shrink-0">
                      {TOOL_LABELS[v.toolUsed] ?? v.toolUsed}
                    </span>
                    <span className="text-sm font-mono text-foreground truncate">
                      {v.inputUrl ?? v.inputText?.slice(0, 60) ?? "—"}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    {v.verdict && (
                      <span className={`text-xs font-mono uppercase ${VERDICT_COLORS[v.verdict] ?? "text-muted-foreground"}`}>
                        {v.verdict.replace(/_/g, " ")}
                      </span>
                    )}
                    <span className="text-xs font-mono text-muted-foreground/50">
                      {new Date(v.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 bg-card border border-border/50 rounded-sm text-center">
              <p className="text-sm font-mono text-muted-foreground mb-4">No verifications yet.</p>
              <Link href="/toolkit" className="text-xs font-mono text-primary hover:underline no-underline">
                Run your first verification →
              </Link>
            </div>
          )}
        </div>

        {/* Submissions */}
        {mySubmissions && mySubmissions.length > 0 && (
          <div>
            <div className="flex items-center gap-4 mb-5">
              <div className="text-xs font-mono tracking-widest uppercase text-muted-foreground">// Your Submissions</div>
              <hr className="flex-1 section-divider" />
            </div>
            <div className="space-y-2">
              {mySubmissions.map((s) => (
                <div key={s.id} className="p-4 bg-card border border-border/50 rounded-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-mono text-foreground">{s.title}</span>
                    <span className={`text-xs font-mono ${s.status === "accepted" ? "text-green-400" : s.status === "rejected" ? "text-red-400" : "text-yellow-400"}`}>
                      {s.status.toUpperCase()}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-muted-foreground/50">
                    {new Date(s.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

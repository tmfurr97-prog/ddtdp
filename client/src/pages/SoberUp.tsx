import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";

const HOAX_TYPES = ["Health Misinformation", "Political Disinformation", "Financial Scam", "Deepfake/Synthetic Media", "Conspiracy Theory", "Phishing/Scam Email", "Social Media Hoax", "Other"];

export default function SoberUp() {
  const { isAuthenticated } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ displayName: "", story: "", hoaxType: "", duration: "" });

  const { data: testimonials, isLoading, refetch } = trpc.testimonials.list.useQuery();
  const submit = trpc.testimonials.submit.useMutation({
    onSuccess: () => {
      toast.success("Your story has been submitted for review. Thank you for speaking up.");
      setShowForm(false);
      setForm({ displayName: "", story: "", hoaxType: "", duration: "" });
      refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const PLACEHOLDER_STORIES = [
    {
      id: 1,
      displayName: "Marcus T.",
      story: "I shared a video claiming a local politician had been arrested. It had 50k views and looked totally legit. Turns out it was from a completely different country, three years old. I lost friends over it. That's when I realized I had to stop sharing before verifying.",
      hoaxType: "Political Disinformation",
      duration: "2 years ago",
    },
    {
      id: 2,
      displayName: "Anonymous",
      story: "I almost sent $2,000 to what I thought was my nephew in trouble overseas. The email was so convincing — it had his name, mentioned family details I thought only he'd know. Turned out it was a scammer who'd scraped his social media. DDTDP's email scanner would have caught it in seconds.",
      hoaxType: "Financial Scam",
      duration: "6 months ago",
    },
    {
      id: 3,
      displayName: "Dr. Priya S.",
      story: "As a physician, I was embarrassed to admit I almost shared a health misinformation post about a new treatment. The language sounded scientific. It had citations — fake ones, but they looked real. I now run everything through a verification check before sharing, even in my professional networks.",
      hoaxType: "Health Misinformation",
      duration: "1 year ago",
    },
    {
      id: 4,
      displayName: "James K.",
      story: "I spent six months in a conspiracy theory rabbit hole. Every piece of 'evidence' led to another. The community felt real, supportive even. Getting out required me to deliberately seek out opposing evidence and sit with the discomfort of being wrong. It's a process, not a moment.",
      hoaxType: "Conspiracy Theory",
      duration: "3 years ago",
    },
    {
      id: 5,
      displayName: "Sarah M.",
      story: "A deepfake of my favorite celebrity endorsing a crypto scheme almost got me. The voice was perfect. The video was seamless. I only caught it because the URL was slightly wrong. Now I check everything twice.",
      hoaxType: "Deepfake/Synthetic Media",
      duration: "8 months ago",
    },
  ];

  const displayStories = (testimonials && testimonials.length > 0) ? testimonials : PLACEHOLDER_STORIES;

  return (
    <div className="min-h-screen py-12">
      <div className="container">
        {/* Header */}
        <div className="mb-12">
          <div className="text-xs font-mono tracking-widest uppercase text-purple-400 mb-3">// Sober Up</div>
          <h1 className="text-5xl md:text-7xl font-display tracking-widest text-foreground mb-4">
            YOU'RE NOT<br />
            <span className="text-purple-400">ALONE</span>
          </h1>
          <p className="text-muted-foreground font-mono max-w-2xl leading-relaxed">
            Real stories from real people who got played by misinformation — and came out the other side. No judgment. Just honesty. Because the first step to media literacy is admitting you've been fooled.
          </p>
        </div>

        {/* CTA */}
        <div className="flex items-center justify-between mb-10">
          <div className="text-xs font-mono text-muted-foreground">
            {displayStories.length} stories shared
          </div>
          <button
            onClick={() => {
              if (!isAuthenticated) {
                window.location.href = getLoginUrl();
                return;
              }
              setShowForm(!showForm);
            }}
            className="px-5 py-2.5 border border-purple-400/30 text-purple-400 text-xs font-mono tracking-widest uppercase hover:border-purple-400/60 hover:bg-purple-400/5 transition-all rounded-sm"
          >
            {showForm ? "Cancel" : "Share Your Story"}
          </button>
        </div>

        {/* Submit Form */}
        {showForm && (
          <div className="bg-card border border-purple-400/20 rounded-sm p-6 mb-10 space-y-4">
            <div className="text-sm font-mono text-muted-foreground mb-2">
              Your story will be reviewed before publishing. You can remain anonymous.
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-mono tracking-widest uppercase text-muted-foreground block mb-2">Display Name (optional)</label>
                <input
                  value={form.displayName}
                  onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                  placeholder="Leave blank to stay anonymous"
                  className="w-full bg-background border border-border/50 rounded-sm px-4 py-2.5 text-sm font-mono text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-purple-400/50 transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-mono tracking-widest uppercase text-muted-foreground block mb-2">Type of Misinformation</label>
                <select
                  value={form.hoaxType}
                  onChange={(e) => setForm({ ...form, hoaxType: e.target.value })}
                  className="w-full bg-background border border-border/50 rounded-sm px-4 py-2.5 text-sm font-mono text-foreground focus:outline-none focus:border-purple-400/50 transition-colors"
                >
                  <option value="">Select type...</option>
                  {HOAX_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs font-mono tracking-widest uppercase text-muted-foreground block mb-2">Your Story *</label>
              <textarea
                value={form.story}
                onChange={(e) => setForm({ ...form, story: e.target.value })}
                placeholder="What happened? What did you believe? How did you find out it was false? What changed for you? Be as honest as you're comfortable being..."
                rows={6}
                className="w-full bg-background border border-border/50 rounded-sm px-4 py-2.5 text-sm font-mono text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-purple-400/50 transition-colors resize-none"
              />
            </div>
            <div>
              <label className="text-xs font-mono tracking-widest uppercase text-muted-foreground block mb-2">When did this happen?</label>
              <input
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
                placeholder="e.g. 2 years ago, last month..."
                className="w-full bg-background border border-border/50 rounded-sm px-4 py-2.5 text-sm font-mono text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-purple-400/50 transition-colors"
              />
            </div>
            <button
              onClick={() => {
                if (!form.story || form.story.length < 50) {
                  toast.error("Please share more of your story (at least 50 characters)");
                  return;
                }
                submit.mutate({
                  displayName: form.displayName || undefined,
                  story: form.story,
                  hoaxType: form.hoaxType || undefined,
                  duration: form.duration || undefined,
                });
              }}
              disabled={submit.isPending}
              className="px-6 py-2.5 bg-purple-500/80 hover:bg-purple-500 text-white font-mono tracking-widest uppercase text-xs disabled:opacity-50 transition-all rounded-sm"
            >
              {submit.isPending ? "Submitting..." : "Share Story"}
            </button>
          </div>
        )}

        {/* Stories Grid */}
        {isLoading ? (
          <div className="space-y-4">
            {Array(3).fill(null).map((_, i) => (
              <div key={i} className="p-6 bg-card border border-border/50 rounded-sm animate-pulse">
                <div className="h-4 bg-secondary rounded mb-4 w-24" />
                <div className="h-4 bg-secondary rounded mb-2" />
                <div className="h-4 bg-secondary rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {displayStories.map((story) => (
              <div key={story.id} className="p-6 bg-card border border-border/50 hover:border-purple-400/20 rounded-sm transition-all">
                <div className="flex items-start gap-4">
                  <div className="text-4xl text-muted-foreground/20 font-display leading-none mt-1">"</div>
                  <div className="flex-1">
                    <p className="text-sm font-mono text-muted-foreground leading-relaxed mb-4">{story.story}</p>
                    <div className="flex items-center gap-4 flex-wrap">
                      <span className="text-xs font-mono text-foreground font-semibold">{story.displayName ?? "Anonymous"}</span>
                      {story.hoaxType && (
                        <span className="text-xs font-mono text-purple-400/70 border border-purple-400/20 px-2 py-0.5 rounded-sm">{story.hoaxType}</span>
                      )}
                      {story.duration && (
                        <span className="text-xs font-mono text-muted-foreground/50">{story.duration}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

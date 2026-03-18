import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";

const ORG_TYPES = [
  { value: "fact_checker", label: "Fact-Checking Organization" },
  { value: "journalist", label: "Journalist / Media Professional" },
  { value: "ngo", label: "NGO / Nonprofit" },
  { value: "academic", label: "Academic Institution" },
  { value: "media_org", label: "Media Organization" },
];

const PARTNER_BENEFITS = [
  { icon: "🏅", title: "Verified Partner Badge", desc: "Display the DDTDP verified partner badge on your platform, signaling credibility to your audience." },
  { icon: "🔗", title: "Cross-Platform Promotion", desc: "Featured listing in our partner directory, shared with our growing community of critical thinkers." },
  { icon: "🛠", title: "API Access", desc: "Integrate our verification tools directly into your platform via our partner API." },
  { icon: "📊", title: "Shared Research", desc: "Access to our misinformation trend data and early alerts on emerging hoax campaigns." },
  { icon: "📣", title: "Co-Branded Content", desc: "Collaborate on educational content, webinars, and campaigns to amplify your message." },
  { icon: "💬", title: "Partner Network", desc: "Connect with other verified organizations fighting misinformation in our private partner network." },
];

const PLACEHOLDER_PARTNERS = [
  { id: 1, orgName: "MediaWatch International", orgType: "fact_checker", website: "https://mediawatch.org", description: "Global fact-checking network operating in 40+ countries." },
  { id: 2, orgName: "Digital Truth Lab", orgType: "academic", website: "https://digitaltruthlab.edu", description: "University research center studying online misinformation." },
  { id: 3, orgName: "Press Integrity Project", orgType: "journalist", website: "https://pressintegrity.org", description: "Coalition of investigative journalists committed to accuracy." },
];

export default function Partners() {
  const { isAuthenticated } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ orgName: "", orgType: "" as "fact_checker" | "journalist" | "ngo" | "academic" | "media_org" | "", website: "", description: "", applicationNote: "" });

  const { data: partners } = trpc.partners.list.useQuery();
  const { data: myPartner } = trpc.partners.myPartner.useQuery(undefined, { enabled: isAuthenticated });
  const apply = trpc.partners.submitApplication.useMutation({
    onSuccess: () => {
      toast.success("Application submitted! We'll review it within 5 business days.");
      setShowForm(false);
    },
    onError: (err) => toast.error(err.message),
  });

  const displayPartners = (partners && partners.length > 0) ? partners : PLACEHOLDER_PARTNERS;

  return (
    <div className="min-h-screen py-12">
      <div className="container">
        {/* Header */}
        <div className="mb-12">
          <div className="text-xs font-mono tracking-widest uppercase text-muted-foreground mb-3">// Partner Badges</div>
          <h1 className="text-5xl md:text-7xl font-display tracking-widest text-foreground mb-4">
            FIGHT WITH<br />
            <span className="text-primary">US</span>
          </h1>
          <p className="text-muted-foreground font-mono max-w-2xl leading-relaxed">
            We partner with fact-checkers, journalists, NGOs, and academic institutions who share our commitment to media literacy. Verified partners get access to our tools, data, and audience.
          </p>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-16">
          {PARTNER_BENEFITS.map((benefit) => (
            <div key={benefit.title} className="p-5 bg-card border border-border/50 rounded-sm">
              <div className="text-2xl mb-3">{benefit.icon}</div>
              <h3 className="text-base font-display tracking-wide text-foreground mb-2">{benefit.title}</h3>
              <p className="text-xs font-mono text-muted-foreground leading-relaxed">{benefit.desc}</p>
            </div>
          ))}
        </div>

        {/* Verified Partners */}
        <div className="mb-16">
          <div className="flex items-center gap-4 mb-6">
            <div className="text-xs font-mono tracking-widest uppercase text-muted-foreground">// Verified Partners</div>
            <hr className="flex-1 section-divider" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {displayPartners.map((partner) => (
              <div key={partner.id} className="p-5 bg-card border border-border/50 rounded-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-sm bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-xs">✓</div>
                  <span className="text-xs font-mono text-primary">Verified Partner</span>
                </div>
                <h3 className="text-base font-display tracking-wide text-foreground mb-1">{partner.orgName}</h3>
                <div className="text-xs font-mono text-muted-foreground mb-2">
                  {ORG_TYPES.find((t) => t.value === partner.orgType)?.label ?? partner.orgType}
                </div>
                <p className="text-xs font-mono text-muted-foreground leading-relaxed mb-3">{partner.description}</p>
                {partner.website && (
                  <a href={partner.website} target="_blank" rel="noopener noreferrer" className="text-xs font-mono text-primary/70 hover:text-primary transition-colors no-underline">
                    Visit →
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Application */}
        <div className="border-t border-border/50 pt-12">
          <div className="max-w-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="text-xs font-mono tracking-widest uppercase text-muted-foreground mb-1">// Apply</div>
                <h2 className="text-3xl font-display tracking-wide text-foreground">Become a Partner</h2>
              </div>
              {myPartner ? (
                <div className="text-xs font-mono text-green-400 border border-green-400/30 px-3 py-1.5 rounded-sm">
                  Application Submitted
                </div>
              ) : (
                <button
                  onClick={() => {
                    if (!isAuthenticated) { window.location.href = getLoginUrl(); return; }
                    setShowForm(!showForm);
                  }}
                  className="px-5 py-2.5 border border-primary/30 text-primary text-xs font-mono tracking-widest uppercase hover:border-primary/60 hover:bg-primary/5 transition-all rounded-sm"
                >
                  {showForm ? "Cancel" : "Apply Now"}
                </button>
              )}
            </div>

            {showForm && (
              <div className="bg-card border border-border/50 rounded-sm p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-mono tracking-widest uppercase text-muted-foreground block mb-2">Organization Name *</label>
                    <input
                      value={form.orgName}
                      onChange={(e) => setForm({ ...form, orgName: e.target.value })}
                      placeholder="Your organization name"
                      className="w-full bg-background border border-border/50 rounded-sm px-4 py-2.5 text-sm font-mono text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-mono tracking-widest uppercase text-muted-foreground block mb-2">Organization Type *</label>
                    <select
                      value={form.orgType}
                      onChange={(e) => setForm({ ...form, orgType: e.target.value as typeof form.orgType })}
                      className="w-full bg-background border border-border/50 rounded-sm px-4 py-2.5 text-sm font-mono text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                    >
                      <option value="">Select type...</option>
                      {ORG_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-mono tracking-widest uppercase text-muted-foreground block mb-2">Website</label>
                  <input
                    value={form.website}
                    onChange={(e) => setForm({ ...form, website: e.target.value })}
                    placeholder="https://yourorg.com"
                    className="w-full bg-background border border-border/50 rounded-sm px-4 py-2.5 text-sm font-mono text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono tracking-widest uppercase text-muted-foreground block mb-2">Organization Description *</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Tell us about your organization and your work in media literacy or fact-checking..."
                    rows={3}
                    className="w-full bg-background border border-border/50 rounded-sm px-4 py-2.5 text-sm font-mono text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50 transition-colors resize-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono tracking-widest uppercase text-muted-foreground block mb-2">Why Partner With DDTDP? *</label>
                  <textarea
                    value={form.applicationNote}
                    onChange={(e) => setForm({ ...form, applicationNote: e.target.value })}
                    placeholder="How would a partnership benefit both organizations? What do you bring to the table?"
                    rows={3}
                    className="w-full bg-background border border-border/50 rounded-sm px-4 py-2.5 text-sm font-mono text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50 transition-colors resize-none"
                  />
                </div>
                <button
                  onClick={() => {
                    if (!form.orgName || !form.orgType || !form.description || !form.applicationNote) {
                      toast.error("Please fill in all required fields");
                      return;
                    }
                    if (form.description.length < 50) { toast.error("Description too short"); return; }
                    if (form.applicationNote.length < 20) { toast.error("Application note too short"); return; }
                    apply.mutate({
                      orgName: form.orgName,
                      orgType: form.orgType as "fact_checker" | "journalist" | "ngo" | "academic" | "media_org",
                      website: form.website || undefined,
                      description: form.description,
                      applicationNote: form.applicationNote,
                    });
                  }}
                  disabled={apply.isPending}
                  className="px-6 py-2.5 bg-primary text-primary-foreground font-mono tracking-widest uppercase text-xs hover:bg-primary/90 disabled:opacity-50 transition-all rounded-sm"
                >
                  {apply.isPending ? "Submitting..." : "Submit Application"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

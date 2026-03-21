import { useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { ArrowRight, Mail, AlertCircle } from "lucide-react";

export default function ForwardEmail() {
  const [form, setForm] = useState({
    senderEmail: "",
    senderName: "",
    companyName: "",
    subject: "",
    emailBody: "",
    suspiciousHooks: "",
  });

  const submit = trpc.emailForwarding.submit.useMutation({
    onSuccess: () => {
      toast.success("Email submitted for analysis!");
      setForm({
        senderEmail: "",
        senderName: "",
        companyName: "",
        subject: "",
        emailBody: "",
        suspiciousHooks: "",
      });
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSubmit = () => {
    if (!form.senderEmail || !form.emailBody) {
      toast.error("Sender email and email body are required");
      return;
    }
    submit.mutate(form);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="border-b border-border/30 bg-background/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-mono font-bold tracking-widest uppercase text-foreground">
            Forward Suspicious Email
          </h1>
          <p className="text-sm text-muted-foreground mt-2 font-mono">
            Send us emails that look fake or scammy. We'll analyze them and post what we find.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Info Box */}
        <div className="bg-accent/10 border border-accent/30 rounded-sm p-6 mb-8">
          <div className="flex gap-4">
            <Mail className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-mono font-bold text-accent mb-2">How This Works</h3>
              <ul className="space-y-2 text-sm text-foreground/80">
                <li>• Copy the email that looks suspicious and paste it below</li>
                <li>• Tell us who sent it and what company they claimed to be from</li>
                <li>• Point out what made it look fake (links, spelling, urgency, etc.)</li>
                <li>• We'll analyze it and post our findings on the site</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-6">
          {/* Sender Email */}
          <div>
            <label className="text-xs font-mono tracking-widest uppercase text-muted-foreground block mb-2">
              Sender's Email Address
            </label>
            <input
              type="email"
              value={form.senderEmail}
              onChange={(e) => setForm({ ...form, senderEmail: e.target.value })}
              placeholder="scammer@fake-bank.com"
              className="w-full bg-background border border-border/50 rounded-sm px-4 py-2.5 text-sm font-mono text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-accent/50 transition-colors"
            />
          </div>

          {/* Sender Name */}
          <div>
            <label className="text-xs font-mono tracking-widest uppercase text-muted-foreground block mb-2">
              Who They Said They Were (optional)
            </label>
            <input
              type="text"
              value={form.senderName}
              onChange={(e) => setForm({ ...form, senderName: e.target.value })}
              placeholder="e.g., John Smith, Support Team"
              className="w-full bg-background border border-border/50 rounded-sm px-4 py-2.5 text-sm font-mono text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-accent/50 transition-colors"
            />
          </div>

          {/* Company Name */}
          <div>
            <label className="text-xs font-mono tracking-widest uppercase text-muted-foreground block mb-2">
              Company They Claimed to Be From (optional)
            </label>
            <input
              type="text"
              value={form.companyName}
              onChange={(e) => setForm({ ...form, companyName: e.target.value })}
              placeholder="e.g., PayPal, Amazon, Your Bank"
              className="w-full bg-background border border-border/50 rounded-sm px-4 py-2.5 text-sm font-mono text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-accent/50 transition-colors"
            />
          </div>

          {/* Subject */}
          <div>
            <label className="text-xs font-mono tracking-widest uppercase text-muted-foreground block mb-2">
              Email Subject (optional)
            </label>
            <input
              type="text"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              placeholder="e.g., URGENT: Verify Your Account Now"
              className="w-full bg-background border border-border/50 rounded-sm px-4 py-2.5 text-sm font-mono text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-accent/50 transition-colors"
            />
          </div>

          {/* Email Body */}
          <div>
            <label className="text-xs font-mono tracking-widest uppercase text-muted-foreground block mb-2">
              Full Email Text
            </label>
            <textarea
              value={form.emailBody}
              onChange={(e) => setForm({ ...form, emailBody: e.target.value })}
              placeholder="Paste the entire email here..."
              rows={10}
              className="w-full bg-background border border-border/50 rounded-sm px-4 py-2.5 text-sm font-mono text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-accent/50 transition-colors resize-none"
            />
          </div>

          {/* Suspicious Hooks */}
          <div>
            <label className="text-xs font-mono tracking-widest uppercase text-muted-foreground block mb-2">
              What Made It Look Fake? (optional)
            </label>
            <textarea
              value={form.suspiciousHooks}
              onChange={(e) => setForm({ ...form, suspiciousHooks: e.target.value })}
              placeholder="e.g., Weird spelling, urgent deadline, asks for password, suspicious link, etc."
              rows={4}
              className="w-full bg-background border border-border/50 rounded-sm px-4 py-2.5 text-sm font-mono text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-accent/50 transition-colors resize-none"
            />
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={submit.isPending}
            className="w-full px-6 py-3 bg-accent text-accent-foreground font-mono tracking-widest uppercase text-sm hover:bg-accent/90 disabled:opacity-50 transition-all rounded-sm flex items-center justify-center gap-2"
          >
            {submit.isPending ? "Submitting..." : "Submit for Analysis"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Info Section */}
        <div className="mt-12 pt-8 border-t border-border/30">
          <h2 className="text-xl font-mono font-bold tracking-widest uppercase mb-4">What Happens Next?</h2>
          <div className="space-y-4 text-sm text-foreground/80">
            <p>
              <strong>We analyze it:</strong> Our team looks at the email for red flags like phishing tactics, fake links, and scam patterns.
            </p>
            <p>
              <strong>We post the breakdown:</strong> We add it to our Deconstruct Lab with a full breakdown of what's wrong and why it's fake.
            </p>
            <p>
              <strong>You learn:</strong> Everyone can see the analysis and learn how to spot similar scams.
            </p>
          </div>
        </div>

        {/* Direct Email Option */}
        <div className="mt-8 p-6 bg-muted/30 border border-border/30 rounded-sm">
          <div className="flex gap-3 items-start">
            <AlertCircle className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-mono font-bold mb-2">Or forward directly to:</p>
              <p className="font-mono text-accent break-all">digitalpunch.refurrm@gmail.com</p>
              <p className="text-muted-foreground mt-2">Just forward the suspicious email to this address and we'll review it.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

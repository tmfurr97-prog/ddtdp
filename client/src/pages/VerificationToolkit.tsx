import { useState } from "react";
import { Link } from "wouter";

export default function VerificationToolkit() {
  const [activeTab, setActiveTab] = useState<"url" | "text" | "email" | "video">("url");

  const tools = {
    url: {
      icon: "🔗",
      title: "Check a Link",
      desc: "Paste a link to see if it's real or fake.",
      placeholder: "Paste the link here...",
      cta: "Check This Link",
    },
    text: {
      icon: "📝",
      title: "Check Text or a Post",
      desc: "Paste any text to see if it has lies or fake facts.",
      placeholder: "Paste the text or post here...",
      cta: "Check This Text",
    },
    email: {
      icon: "📧",
      title: "Check an Email",
      desc: "Paste an email to see if it's a scam.",
      placeholder: "Paste the email here...",
      cta: "Check This Email",
    },
    video: {
      icon: "🎥",
      title: "Check a Video",
      desc: "Paste a video link to see if it's real or fake.",
      placeholder: "Paste the video link here...",
      cta: "Check This Video",
    },
  };

  const tool = tools[activeTab];

  return (
    <div className="min-h-screen py-12">
      <div className="container max-w-3xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="text-xs font-mono tracking-widest uppercase text-muted-foreground mb-4">
            // Verification Tools
          </div>
          <h1 className="text-5xl md:text-6xl font-display tracking-widest text-foreground mb-4">
            Check Before You <span className="text-primary">Share</span>
          </h1>
          <p className="text-lg font-mono text-muted-foreground leading-relaxed">
            Pick a tool below. Paste what you want to check. We'll tell you if it's real or fake.
          </p>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {(["url", "text", "email", "video"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`p-4 rounded-sm font-mono tracking-widest uppercase text-sm transition-all ${
                activeTab === tab
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-border text-muted-foreground hover:border-primary"
              }`}
            >
              <div className="text-2xl mb-1">{tools[tab].icon}</div>
              <div className="text-xs">{tools[tab].title.split(" ")[1]}</div>
            </button>
          ))}
        </div>

        {/* Tool Content */}
        <div className="bg-card border border-border rounded-sm p-8">
          <div className="text-3xl mb-4">{tool.icon}</div>
          <h2 className="text-2xl font-display text-foreground mb-2">{tool.title}</h2>
          <p className="text-muted-foreground font-mono mb-6">{tool.desc}</p>

          <textarea
            placeholder={tool.placeholder}
            rows={6}
            className="w-full bg-background border border-border rounded-sm px-4 py-3 font-mono text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary transition-colors mb-6 resize-none"
          />

          <Link
            href={`/${activeTab === "url" ? "analyzer" : activeTab === "text" ? "analyzer" : activeTab === "email" ? "email-scanner" : "video-analyzer"}`}
            className="block w-full py-4 bg-primary text-primary-foreground font-mono tracking-widest uppercase text-base hover:bg-primary/90 transition-all rounded-sm text-center no-underline font-bold"
          >
            {tool.cta}
          </Link>
        </div>

        {/* Email Forwarding */}
        <div className="mt-12 p-8 bg-accent/5 border border-accent/30 rounded-sm">
          <div className="text-xs font-mono tracking-widest uppercase text-accent mb-3">// Can't Figure It Out?</div>
          <h3 className="text-2xl font-display text-foreground mb-3">Send Us an Email</h3>
          <p className="text-muted-foreground font-mono mb-4 leading-relaxed">
            Forward us any email you think is a scam or fake. We'll check it and post the results on our website so everyone can learn from it.
          </p>
          <p className="text-lg font-mono font-bold text-accent mb-4">
            📧 digitalpunch.refurrm@gmail.com
          </p>
          <p className="text-sm font-mono text-muted-foreground">
            Include: Who it's from, what company they claim to be, and what they're asking for. We'll respond and share what we find!
          </p>
        </div>

        {/* Tips */}
        <div className="mt-12">
          <div className="text-xs font-mono tracking-widest uppercase text-muted-foreground mb-6">// Quick Tips</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              "Check the sender's email address. Scammers use fake emails that look real.",
              "Look for spelling and grammar mistakes. Real companies don't send sloppy emails.",
              "Hover over links to see where they actually go. Scammers hide the real URL.",
              "If it sounds too good to be true, it probably is.",
              "Real banks never ask for passwords or account numbers in emails.",
              "Check the website URL. Fake sites use URLs that look similar but are slightly different.",
            ].map((tip, i) => (
              <div key={i} className="p-4 bg-card border border-border rounded-sm">
                <p className="text-sm font-mono text-muted-foreground flex items-start gap-3">
                  <span className="text-primary font-bold shrink-0">{i + 1}.</span>
                  <span>{tip}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

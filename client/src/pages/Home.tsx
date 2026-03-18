import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="py-20 md:py-32 bg-gradient-to-b from-card to-background">
        <div className="container text-center">
          <div className="text-xs font-mono tracking-widest uppercase text-muted-foreground mb-4">
            // Media Literacy Verification Hub
          </div>
          <h1 className="text-6xl md:text-8xl font-display tracking-widest text-foreground mb-6 glitch" data-text="DON'T DRINK THE PUNCH">
            DON'T DRINK THE PUNCH
          </h1>
          <p className="text-lg md:text-xl font-mono text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
            Think before you share. Check before you believe. We help you spot fake news, scams, and lies online.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/toolkit" className="px-8 py-4 bg-primary text-primary-foreground font-mono tracking-widest uppercase text-base hover:bg-primary/90 transition-all rounded-sm no-underline font-bold">
              Check Something Now
            </Link>
            <a href={isAuthenticated ? "#" : getLoginUrl()} className="px-8 py-4 border-2 border-primary text-primary font-mono tracking-widest uppercase text-base hover:bg-primary/5 transition-all rounded-sm no-underline font-bold">
              {isAuthenticated ? "Go to Tools" : "Sign In"}
            </a>
          </div>
        </div>
      </section>

      {/* Manifesto */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container max-w-3xl">
          <div className="text-xs font-mono tracking-widest uppercase text-muted-foreground mb-6">// The Problem</div>
          <h2 className="text-4xl md:text-5xl font-display tracking-widest text-foreground mb-8">
            Fake News is <span className="text-primary">Everywhere</span>
          </h2>
          <div className="space-y-6 text-lg font-mono text-muted-foreground leading-relaxed">
            <p>
              Every day, millions of people share things online without checking if they're real. A fake email pretends to be your bank. A video that looks real is actually fake. A story that sounds true is actually a lie.
            </p>
            <p>
              These tricks are designed to fool you. They use fear, anger, and fake evidence to make you believe them. And they work.
            </p>
            <p>
              <strong className="text-foreground">We're here to help you stay sharp.</strong> We give you simple tools to check if something is real before you share it or fall for it.
            </p>
          </div>
        </div>
      </section>

      {/* Tools Overview */}
      <section className="py-16 md:py-24 bg-card">
        <div className="container">
          <div className="text-xs font-mono tracking-widest uppercase text-muted-foreground mb-6">// What We Can Check</div>
          <h2 className="text-4xl md:text-5xl font-display tracking-widest text-foreground mb-12">
            Four Tools to Stay <span className="text-accent">Safe</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { icon: "🔗", title: "Check a Link", desc: "Is this website real or fake? We check if the link is safe to click." },
              { icon: "📝", title: "Check Text", desc: "Is this post true? We look for lies, fake facts, and manipulation tricks." },
              { icon: "📧", title: "Check an Email", desc: "Is this email a scam? We spot phishing, fake banks, and money tricks." },
              { icon: "🎥", title: "Check a Video", desc: "Is this video real or fake? We spot deepfakes and manipulated videos." },
            ].map((tool) => (
              <Link
                key={tool.title}
                href="/toolkit"
                className="p-6 bg-background border-2 border-border hover:border-primary transition-all rounded-sm no-underline group"
              >
                <div className="text-4xl mb-4">{tool.icon}</div>
                <h3 className="text-xl font-display text-foreground mb-2 group-hover:text-primary transition-colors">{tool.title}</h3>
                <p className="text-sm font-mono text-muted-foreground">{tool.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Learn Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container">
          <div className="text-xs font-mono tracking-widest uppercase text-muted-foreground mb-6">// Learn More</div>
          <h2 className="text-4xl md:text-5xl font-display tracking-widest text-foreground mb-12">
            How to Spot <span className="text-accent">Lies</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[
              { num: "1", title: "Stop", desc: "Before you share something, stop and ask: Is this real?" },
              { num: "2", title: "Check", desc: "Use our tools. Look for the source. Read other articles about it." },
              { num: "3", title: "Share", desc: "Only share things you know are real. You can help stop lies." },
            ].map((step) => (
              <div key={step.num} className="p-6 bg-card border border-border rounded-sm">
                <div className="text-3xl font-display text-primary mb-3">{step.num}</div>
                <h3 className="text-lg font-display text-foreground mb-2">{step.title}</h3>
                <p className="text-sm font-mono text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
          <Link href="/train-up" className="inline-block px-6 py-3 border-2 border-accent text-accent font-mono tracking-widest uppercase text-sm hover:bg-accent/5 transition-all rounded-sm no-underline">
            Read Our Guides →
          </Link>
        </div>
      </section>

      {/* Community Section */}
      <section className="py-16 md:py-24 bg-card">
        <div className="container">
          <div className="text-xs font-mono tracking-widest uppercase text-muted-foreground mb-6">// Real Stories</div>
          <h2 className="text-4xl md:text-5xl font-display tracking-widest text-foreground mb-12">
            People Who Got <span className="text-primary">Fooled</span> (And Learned)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {[
              {
                quote: "I shared a fake news story about a celebrity. It got 1,000 likes before I realized it was a lie. I felt so embarrassed.",
                author: "Sarah, 16",
              },
              {
                quote: "My grandpa almost sent money to a fake bank email. I checked it with this tool and it was definitely a scam.",
                author: "Marcus, 14",
              },
            ].map((story, i) => (
              <div key={i} className="p-6 bg-background border border-border rounded-sm">
                <p className="text-lg font-mono text-muted-foreground mb-4 italic">"{story.quote}"</p>
                <p className="text-sm font-mono font-bold text-foreground">— {story.author}</p>
              </div>
            ))}
          </div>
          <Link href="/sober-up" className="inline-block px-6 py-3 bg-primary text-primary-foreground font-mono tracking-widest uppercase text-sm hover:bg-primary/90 transition-all rounded-sm no-underline font-bold">
            Share Your Story
          </Link>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-background border-t border-border">
        <div className="container text-center">
          <h2 className="text-4xl md:text-5xl font-display tracking-widest text-foreground mb-6">
            Ready to Stay <span className="text-accent">Smart</span>?
          </h2>
          <p className="text-lg font-mono text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
            Start checking links, emails, and posts right now. It only takes a few seconds to spot a lie.
          </p>
          <Link href="/toolkit" className="inline-block px-8 py-4 bg-primary text-primary-foreground font-mono tracking-widest uppercase text-base hover:bg-primary/90 transition-all rounded-sm no-underline font-bold">
            Start Checking Now
          </Link>
        </div>
      </section>
    </div>
  );
}

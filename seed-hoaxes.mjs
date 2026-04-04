import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const hoaxes = [
  {
    title: "Amazon Account Verification - Urgent Action Required",
    category: "phishing",
    hook: "Your account has been compromised. Click here to verify immediately.",
    verdict: "false",
    analysis: "This email uses urgency and fear to trick users into clicking a malicious link. The sender domain is fake (amazon-security.com instead of amazon.com). Legitimate companies never ask for passwords or account details via email. Real Amazon never initiates contact asking for verification via email links."
  },
  {
    title: "IRS Tax Refund - Claim Your $1,200 Refund",
    category: "phishing",
    hook: "You are eligible for a $1,200 tax refund. Click to claim now.",
    verdict: "false",
    analysis: "The IRS never initiates contact via email. This is a classic tax refund scam designed to harvest personal information. The sender domain (irs-gov.net) is not the real IRS domain (irs.gov). The IRS communicates via mail, not email."
  },
  {
    title: "PayPal Security Alert - Confirm Your Payment Method",
    category: "phishing",
    hook: "Unusual activity detected. Confirm your payment method within 24 hours.",
    verdict: "false",
    analysis: "This phishing email mimics PayPal's layout and urgency tactics. The sender domain is fake. Real PayPal alerts direct you to log in through their official website, not via email links. PayPal never asks for sensitive information via email."
  },
  {
    title: "Celebrity Deepfake - Tom Hanks Endorses Crypto",
    category: "deepfake",
    hook: "Tom Hanks just announced he's investing in Bitcoin. Watch his video message.",
    verdict: "false",
    analysis: "This is a synthetic video created using deepfake technology. Tom Hanks has publicly warned about deepfakes. The video uses his likeness to promote a cryptocurrency scam. Check official sources before believing celebrity endorsements. No legitimate investment offers guaranteed returns."
  },
  {
    title: "Microsoft Support - Your Computer Has a Virus",
    category: "phishing",
    hook: "CRITICAL: Your Windows PC is infected. Call 1-800-XXX-XXXX immediately.",
    verdict: "false",
    analysis: "This is a classic tech support scam. Microsoft never initiates contact about viruses. The phone number leads to scammers who charge for fake repairs. Real Microsoft support requires you to initiate contact. Never call unsolicited numbers claiming to be tech support."
  },
  {
    title: "Bank of America - Update Your Account Information",
    category: "phishing",
    hook: "Your account will be closed unless you update your information in the next 24 hours.",
    verdict: "false",
    analysis: "This phishing email uses fear and urgency. Real banks never ask for sensitive information via email. The sender domain is spoofed. Always log into your bank's official website directly, never via email links. Banks never threaten account closure via email."
  },
  {
    title: "LinkedIn Job Offer - Work From Home, $5,000/Week",
    category: "phishing",
    hook: "You've been selected for a remote position. No experience needed. Start immediately.",
    verdict: "false",
    analysis: "This is a work-from-home scam. Legitimate job offers don't come from unsolicited emails with unrealistic pay. The sender domain is fake. These scams often ask for upfront payment or personal banking details. If it sounds too good to be true, it is."
  },
  {
    title: "Elon Musk Deepfake - Tesla Stock Giveaway",
    category: "deepfake",
    hook: "Elon Musk is giving away Tesla stock. Send 1 BTC to this address to receive 10 BTC back.",
    verdict: "false",
    analysis: "This combines a deepfake video with a classic cryptocurrency doubling scam. No legitimate investment offers guaranteed returns. The video is AI-generated using Elon's likeness. Anyone sending crypto will lose it permanently. This is a total scam."
  }
];

async function seedHoaxes() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);

  try {
    console.log("Seeding Deconstruct Lab with hoax examples...");

    for (const hoax of hoaxes) {
      const slug = hoax.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 256);
      const query = `
        INSERT INTO hoaxes (
          slug, title, summary, fullBreakdown, verdict, category, status, publishedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const values = [
        slug,
        hoax.title,
        hoax.hook,
        hoax.analysis,
        hoax.verdict,
        hoax.category,
        "published",
        new Date()
      ];

      await connection.execute(query, values);
      console.log(`Added: ${hoax.title}`);
    }

    console.log("\nSuccessfully seeded 8 hoax examples!");
  } catch (error) {
    console.error("Error seeding hoaxes:", error);
  } finally {
    await connection.end();
  }
}

seedHoaxes();

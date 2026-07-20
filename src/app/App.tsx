import { useState, useEffect, useRef, forwardRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight, Send, Sparkles, RotateCcw } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Scene = "landing" | "network" | "detail";
type LayoutMode = "floating" | "thinking" | "results";
interface Message { role: "user" | "ai"; content: string; }
interface Pattern {
  id: string; name: string; category: string; tagline: string;
  description: string; how: string; examples: string[];
  productExample: string; keywords: string[];
}

// ─── Data ────────────────────────────────────────────────────────────────────

const PATTERNS: Pattern[] = [
  { id: "jakobs-law", name: "Jakob's Law", category: "Familiarity", tagline: "Design like the sites users already know",
    description: "Users spend most of their time on other websites, so they prefer your site to work the same way as those they already know.",
    how: "Use patterns users recognize and expect. Prioritize comfort and familiarity over novelty.",
    examples: ["Standard navigation structures", "Industry-norm terminology", "Familiar icon conventions"],
    productExample: "Amazon's checkout mirrors every e-commerce pattern users have learned elsewhere — minimizing friction at the highest-stakes moment.",
    keywords: ["navigation", "familiar", "standard", "usability", "convention", "mental model", "layout", "interface"] },
  { id: "fitts-law", name: "Fitts's Law", category: "Motor Efficiency", tagline: "Make targets bigger and closer",
    description: "The time to reach a target is a function of its size and distance. Larger, nearer targets are faster to click or tap.",
    how: "Make primary buttons large and accessible. Place frequently-used actions within close reach of natural hand positions.",
    examples: ["Large primary CTAs", "Touch-friendly tap targets", "Contextual action placement"],
    productExample: "Spotify's play button is the largest element on any album page — one tap from wherever your thumb naturally rests.",
    keywords: ["button", "click", "tap", "mobile", "size", "touch", "accessibility", "target", "cta"] },
  { id: "hicks-law", name: "Hick's Law", category: "Decision Making", tagline: "Fewer choices, faster decisions",
    description: "Decision time increases with the number and complexity of choices. Reducing options reduces cognitive work and accelerates action.",
    how: "Present only the most relevant options. Use progressive disclosure and highlight recommended actions.",
    examples: ["Curated onboarding paths", "Filtered dropdown menus", "Recommended option highlighting"],
    productExample: "Netflix curates ~40 titles for each user rather than exposing all 15,000 — preventing the paralysis of infinite choice.",
    keywords: ["choice", "options", "menu", "simplify", "filter", "decision", "overwhelm", "onboarding", "pricing"] },
  { id: "feedback-loops", name: "Feedback Loops", category: "Engagement", tagline: "Respond immediately to every action",
    description: "Immediate responses to user actions reinforce engagement and create a sense of control and progress.",
    how: "Design timely, meaningful responses to every user action. Reinforce positive behaviors with visible confirmation.",
    examples: ["Real-time form validation", "Progress indicators", "Completion confirmations"],
    productExample: "Duolingo shows an animated streak flame and confetti burst upon lesson completion — behavioral reinforcement made visceral.",
    keywords: ["feedback", "response", "loading", "confirmation", "progress", "animation", "validation", "real-time"] },
  { id: "gestalt-principles", name: "Gestalt Principles", category: "Visual Perception", tagline: "Group what belongs together",
    description: "People naturally perceive visual elements in groups — by proximity, similarity, and continuity. Design with this in mind.",
    how: "Organize elements to reflect natural perception. Use proximity and similarity to reveal structure and hierarchy.",
    examples: ["Dashboard feature grouping", "Consistent spacing rhythms", "Visual contrast for hierarchy"],
    productExample: "Linear groups issues by project and status — proximity and color similarity communicate team structure at a glance.",
    keywords: ["visual", "layout", "grouping", "design", "hierarchy", "spacing", "organization", "proximity", "similarity"] },
  { id: "temporal-discounting", name: "Temporal Discounting", category: "Motivation", tagline: "Emphasize now over later",
    description: "Users prefer immediate rewards over delayed benefits. The further away a reward, the less motivating it becomes.",
    how: "Emphasize short-term benefits and instant value. Show users what they gain today, not in 90 days.",
    examples: ["'Up in 5 minutes' promises", "Immediate feature previews", "Quick-win first steps"],
    productExample: "Notion's onboarding leads with 'Start writing in seconds' — deferring complexity until users already feel value.",
    keywords: ["reward", "immediate", "onboarding", "quick", "instant", "benefit", "delay", "motivation", "activation"] },
  { id: "peak-end-rule", name: "Peak-End Rule", category: "Memory", tagline: "End on a high note",
    description: "Experiences are remembered by their most intense moment and their ending — not their average quality.",
    how: "Craft impactful moments at critical interactions. Always close workflows with a strong, positive moment.",
    examples: ["Celebratory task completion screens", "Value-driven trial endings", "Milestone animations"],
    productExample: "Mailchimp's 'High Five' screen after sending a campaign is peak-end design — the moment users remember and share.",
    keywords: ["celebration", "completion", "memory", "ending", "moment", "milestone", "experience", "delight", "emotion"] },
  { id: "framing-effect", name: "Framing Effect", category: "Perception", tagline: "How you say it shapes how it's received",
    description: "Presenting information differently shapes emotions and decisions — even when the underlying facts are identical.",
    how: "Present choices aligned with user motivations. Frame benefits as solutions to pain points, not feature lists.",
    examples: ["'Save 20%' vs '20% off'", "Benefit-led pricing tables", "Loss vs gain framing in copy"],
    productExample: "Dropbox frames storage limits as 'running out of space to save memories' — loss framing instead of feature marketing.",
    keywords: ["messaging", "copy", "pricing", "framing", "wording", "language", "marketing", "conversion", "persuasion"] },
  { id: "zeigarnik-effect", name: "Zeigarnik Effect", category: "Completion Drive", tagline: "Incomplete tasks demand attention",
    description: "People remember incomplete tasks better than completed ones. Unfinished work creates productive cognitive tension.",
    how: "Use visual indicators that emphasize unfinished actions. Progress bars trigger the natural desire to complete.",
    examples: ["Onboarding progress bars", "Checklist-based workflows", "Profile completion meters"],
    productExample: "LinkedIn's profile completion meter ('Your profile is 60% complete') is textbook Zeigarnik — users feel compelled to finish.",
    keywords: ["progress", "completion", "checklist", "onboarding", "streak", "reminder", "retention", "percentage"] },
  { id: "reciprocity", name: "Reciprocity Principle", category: "Relationship", tagline: "Give first, receive later",
    description: "Giving value triggers a psychological inclination to reciprocate. People feel compelled to return what they receive.",
    how: "Offer genuine value upfront before asking for commitment. Make users feel the product is already working for them.",
    examples: ["Free templates and tools", "Early-access discounts", "Free onboarding consultations"],
    productExample: "HubSpot gives away entire marketing courses, certifications, and tools free — creating an obligation that converts to paid.",
    keywords: ["free", "value", "gift", "conversion", "trust", "give", "offer", "trial", "freemium", "lead"] },
  { id: "personalization", name: "Personalization", category: "Relevance", tagline: "Make it feel built for them",
    description: "Tailoring experiences to individual behaviors and needs enhances relevance, retention, and emotional connection.",
    how: "Use behavioral data to customize flows and content. Enable users to shape their own experience.",
    examples: ["Segmented onboarding flows", "Tailored feature recommendations", "Customizable dashboards"],
    productExample: "Spotify Wrapped turns a year of listening data into a deeply personal narrative — making each user feel uniquely understood.",
    keywords: ["personal", "customize", "recommendation", "user data", "tailored", "segment", "relevant", "dashboard"] },
  { id: "emotional-design", name: "Emotional Design", category: "Connection", tagline: "Design that makes users feel something",
    description: "Visual and interactive elements that evoke positive emotions create stronger connections and longer retention.",
    how: "Craft interactions that make users feel understood and valued. Use language and motion with human warmth.",
    examples: ["Milestone celebrations", "Humanized error messages", "Playful micro-interactions"],
    productExample: "Headspace's animated characters respond to your mood — turning a data input into an emotional exchange.",
    keywords: ["emotion", "delight", "animation", "copy", "brand", "human", "celebration", "warmth", "micro-interaction"] },
  { id: "habit-formation", name: "Habit Formation", category: "Retention", tagline: "Build triggers that bring users back",
    description: "Habits form by linking triggers, routines, and rewards. Products that slot into existing routines persist.",
    how: "Design triggers and rewards that make returning feel natural. Anchor the product to existing daily routines.",
    examples: ["Usage streaks and badges", "Routine-anchored notifications", "Reward milestones"],
    productExample: "Wordle's daily constraint — one puzzle per day — creates a calendar-anchored ritual users build their morning around.",
    keywords: ["habit", "streak", "daily", "retention", "notification", "reward", "routine", "engagement", "return"] },
  { id: "anchoring-bias", name: "Anchoring Bias", category: "Pricing & Perception", tagline: "The first number sets the frame",
    description: "The first piece of information encountered disproportionately influences all subsequent judgments and comparisons.",
    how: "Present key reference points early. Show premium tiers first to make standard options feel more attractive.",
    examples: ["Premium-first pricing tables", "Crossed-out original prices", "Flagship feature prominence"],
    productExample: "Apple always leads with the Pro model at $1,599 — making the $999 MacBook Air feel like a bargain by contrast.",
    keywords: ["price", "anchor", "comparison", "premium", "discount", "value", "perception", "tier", "pricing"] },
  { id: "loss-aversion", name: "Loss Aversion", category: "Motivation", tagline: "Fear of losing beats hope of gaining",
    description: "People are twice as motivated to avoid losses as they are to acquire equivalent gains. Losses feel disproportionately painful.",
    how: "Frame messages around what users risk losing. Create urgency around expiring opportunities.",
    examples: ["'Don't lose your streak'", "Trial expiration countdowns", "Feature loss warnings on downgrade"],
    productExample: "Snapchat's streak counter — with its urgent fire emoji — uses loss aversion to keep users returning every single day.",
    keywords: ["urgency", "loss", "expiry", "fear", "retention", "churn", "downgrade", "limit", "deadline"] },
  { id: "social-proof", name: "Social Proof", category: "Trust", tagline: "People follow what others are doing",
    description: "Humans look to others' actions and endorsements to guide decisions, especially under uncertainty.",
    how: "Highlight user success stories and visible endorsements. Show real-time usage and community signals.",
    examples: ["Customer testimonials", "Brand logo displays", "Real-time user counts"],
    productExample: "Booking.com shows '23 people viewing this hotel right now' — live social proof that creates urgency and trust simultaneously.",
    keywords: ["testimonial", "reviews", "trust", "credibility", "community", "users", "social", "proof", "endorsement"] },
  { id: "decision-fatigue", name: "Decision Fatigue", category: "Cognitive Relief", tagline: "Decisions exhaust — reduce them",
    description: "Too many decisions deplete cognitive resources. As mental energy drops, users default to avoidance or poor choices.",
    how: "Guide users through essential actions only. Set intelligent defaults that handle decisions before users have to.",
    examples: ["New-user templates", "Smart default selections", "Recommended action highlighting"],
    productExample: "Figma's 'Start from template' option short-circuits the blank-canvas paralysis that kills new user activation.",
    keywords: ["decision", "default", "template", "choice", "simplify", "guide", "cognitive", "onboarding", "overwhelm"] },
  { id: "cognitive-load", name: "Cognitive Load", category: "Clarity", tagline: "Working memory is small — honor it",
    description: "Mental effort required to process information is finite. Overloaded users make errors, slow down, and disengage.",
    how: "Simplify user journeys. Break complex tasks into digestible steps. Use progressive disclosure of complexity.",
    examples: ["Step-by-step onboarding", "Related feature grouping", "Chunked form flows"],
    productExample: "Stripe's payment flow asks for the minimum at each step — card number, then expiry, then CVC — never all at once.",
    keywords: ["complexity", "form", "steps", "progressive", "clarity", "simplify", "chunking", "overload", "wizard"] },
];

// ─── Utilities ────────────────────────────────────────────────────────────────

function scorePatterns(query: string, patterns: Pattern[]): Pattern[] {
  if (!query.trim()) return patterns.slice(0, 3);
  const words = query.toLowerCase().split(/[\s,]+/).filter(Boolean);
  const scored = patterns.map((p) => {
    const corpus = [p.name, p.category, p.tagline, p.description, p.how, ...p.keywords].join(" ").toLowerCase();
    const score = words.reduce((acc, w) => acc + (corpus.includes(w) ? 2 : 0), 0);
    return { p, score: score + Math.random() * 0.5 };
  });
  return scored.sort((a, b) => b.score - a.score).slice(0, 3).map((s) => s.p);
}

function generateExplanation(query: string, patterns: Pattern[]): string {
  const [p1, p2, p3] = patterns;
  const q = query.length > 55 ? query.slice(0, 55) + "…" : query;
  return `For "${q}", three behavioral patterns offer the clearest path forward.\n\n**${p1.name}** is your primary lever — ${p1.tagline.toLowerCase()}. ${p1.how}\n\n**${p2.name}** strengthens the approach: ${p2.tagline.toLowerCase()}. Apply this through ${p2.examples[0].toLowerCase()}.\n\n**${p3.name}** closes the loop. ${p3.how} Together these patterns address the cognitive, motivational, and behavioral dimensions of your challenge.`;
}

function generatePatternInsight(pattern: Pattern, userContext: string): string {
  const q = userContext.length > 65 ? userContext.slice(0, 65) + "…" : userContext;
  const ex1 = pattern.examples[0].toLowerCase();
  const ex2 = pattern.examples[1] ? pattern.examples[1].toLowerCase() : ex1;
  const productSnippet = pattern.productExample.split("—")[0].trim();
  return `For your challenge — "${q}" — here is how **${pattern.name}** applies directly.\n\n${pattern.how}\n\nIn your context this could look like: ${ex1}, or ${ex2}. ${productSnippet} — the same principle directly addresses what you described.`;
}

// ─── Formatted Text ───────────────────────────────────────────────────────────

function FormattedText({ text }: { text: string }) {
  return (
    <div className="space-y-2">
      {text.split("\n").map((line, li) =>
        line === "" ? <div key={li} className="h-1" /> : (
          <p key={li} className="leading-relaxed">
            {line.split(/(\*\*[^*]+\*\*)/).map((chunk, ci) =>
              chunk.startsWith("**") && chunk.endsWith("**") ? (
                <strong key={ci} style={{ fontFamily: "Valve, sans-serif" }}>
                  {chunk.slice(2, -2)}
                </strong>
              ) : chunk
            )}
          </p>
        )
      )}
    </div>
  );
}

// ─── Demo Components ──────────────────────────────────────────────────────────

function DemoShell({ before, after, beforeLabel = "Without pattern", afterLabel = "With pattern" }: {
  before: React.ReactNode; after: React.ReactNode; beforeLabel?: string; afterLabel?: string;
}) {
  const [showing, setShowing] = useState<"before" | "after">("before");
  return (
    <div className="w-full">
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => setShowing("before")} className={`px-4 py-2 text-sm font-medium rounded-full transition-all ${showing === "before" ? "bg-foreground text-background" : "border border-border text-muted-foreground hover:border-foreground hover:text-foreground"}`}>{beforeLabel}</button>
        <button onClick={() => setShowing("after")} className={`px-4 py-2 text-sm font-medium rounded-full transition-all ${showing === "after" ? "bg-foreground text-background" : "border border-border text-muted-foreground hover:border-foreground hover:text-foreground"}`}>{afterLabel}</button>
        <span className="ml-auto text-xs text-muted-foreground font-mono">{showing === "before" ? "← before" : "after →"}</span>
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={showing} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }} className="bg-card rounded-xl border border-border overflow-hidden min-h-[220px] flex items-center justify-center">
          {showing === "before" ? before : after}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function PatternDemo({ patternId }: { patternId: string }) {
  const demos: Record<string, React.ReactNode> = {
    "jakobs-law": (<DemoShell beforeLabel="Unfamiliar layout" afterLabel="Standard layout"
      before={<div className="w-full p-6"><div className="bg-background rounded-lg border border-border p-4"><div className="flex flex-col items-center gap-3 mb-4"><div className="w-8 h-1 bg-foreground/20 rounded"/><div className="w-6 h-1 bg-foreground/20 rounded"/><div className="w-10 h-1 bg-foreground/20 rounded"/></div><div className="text-center text-xs text-muted-foreground mb-4">Menu hidden in sidebar icon</div><div className="flex flex-wrap gap-2 justify-center">{["☰ Open nav","↗ Go back","✦ Search?","⋯ More"].map(l=><div key={l} className="text-xs px-2 py-1 border border-border rounded text-muted-foreground">{l}</div>)}</div></div></div>}
      after={<div className="w-full p-6"><div className="bg-background rounded-lg border border-border overflow-hidden"><div className="border-b border-border px-4 py-3 flex items-center justify-between"><span className="font-medium text-sm">MyApp</span><div className="flex items-center gap-4 text-xs text-muted-foreground"><span>Features</span><span>Pricing</span><span>Docs</span><span className="bg-foreground text-background px-3 py-1 rounded-full">Sign up</span></div></div><div className="p-6 text-center"><div className="text-sm font-medium mb-1">Standard navigation</div><div className="text-xs text-muted-foreground">Users know exactly where everything is</div></div></div></div>}
    />),
    "fitts-law": (<DemoShell beforeLabel="Hard to click" afterLabel="Easy to click"
      before={<div className="w-full p-8 flex flex-col gap-4 items-center"><div className="text-xs text-muted-foreground mb-2">Subscribe to our newsletter</div><input className="border border-border rounded px-2 py-1 text-xs w-48 bg-background" placeholder="your@email.com" readOnly/><div className="flex gap-8 mt-2"><a className="text-[10px] underline text-muted-foreground">maybe later</a><a className="text-[10px] underline text-accent">subscribe</a></div><p className="text-xs text-muted-foreground/60 mt-2">Tiny targets scattered far apart</p></div>}
      after={<div className="w-full p-8 flex flex-col gap-4 items-center"><div className="text-xs text-muted-foreground mb-2">Subscribe to our newsletter</div><input className="border border-border rounded-lg px-3 py-2 text-sm w-56 bg-background" placeholder="your@email.com" readOnly/><button className="bg-foreground text-background text-sm font-medium px-8 py-3 rounded-full w-56">Subscribe now</button><p className="text-[10px] text-muted-foreground/60">Dismiss</p></div>}
    />),
    "hicks-law": (<DemoShell beforeLabel="Too many options" afterLabel="Curated choices"
      before={<div className="w-full p-4"><div className="text-xs text-center text-muted-foreground mb-3">Choose your plan:</div><div className="grid grid-cols-4 gap-1.5">{["Micro","Starter","Basic","Pro","Business","Growth","Agency","Enterprise"].map(t=><div key={t} className="border border-border p-2 rounded text-center text-[10px]"><div className="font-medium">{t}</div><div className="text-muted-foreground">$?/mo</div></div>)}</div></div>}
      after={<div className="w-full p-5"><div className="text-xs text-center text-muted-foreground mb-3">Choose your plan:</div><div className="grid grid-cols-3 gap-3">{[{n:"Starter",p:"$9",d:"For individuals"},{n:"Pro",p:"$29",d:"Most popular",rec:true},{n:"Team",p:"$79",d:"For teams"}].map(t=><div key={t.n} className={`p-3 rounded-xl border text-center text-xs ${t.rec?"border-foreground bg-foreground text-background":"border-border"}`}>{t.rec&&<div className="text-[9px] font-mono mb-1 opacity-70">RECOMMENDED</div>}<div className="font-semibold">{t.n}</div><div className="text-lg font-bold my-1">{t.p}<span className="text-[9px] font-normal opacity-70">/mo</span></div><div className={`text-[10px] ${t.rec?"opacity-70":"text-muted-foreground"}`}>{t.d}</div></div>)}</div></div>}
    />),
    "feedback-loops": (<DemoShell beforeLabel="Silent form" afterLabel="Live validation"
      before={<div className="w-full p-6"><div className="space-y-3 max-w-xs mx-auto"><div><div className="text-xs font-medium mb-1">Email</div><div className="border border-border rounded px-3 py-2 text-xs text-muted-foreground bg-background">john@</div></div><div><div className="text-xs font-medium mb-1">Password</div><div className="border border-border rounded px-3 py-2 text-xs text-muted-foreground bg-background">••••••</div></div><button className="w-full bg-foreground text-background text-xs py-2 rounded mt-2">Submit</button><p className="text-[10px] text-muted-foreground text-center">No feedback until after submit</p></div></div>}
      after={<div className="w-full p-6"><div className="space-y-3 max-w-xs mx-auto"><div><div className="text-xs font-medium mb-1">Email</div><div className="border border-destructive rounded px-3 py-2 text-xs text-muted-foreground bg-background flex items-center justify-between"><span>john@</span><span className="text-destructive text-[10px]">Invalid email</span></div></div><div><div className="text-xs font-medium mb-1">Password</div><div className="border border-accent rounded px-3 py-2 text-xs text-muted-foreground bg-background flex items-center justify-between"><span>••••••••</span><span className="text-accent text-[10px]">✓ Strong</span></div></div><div className="h-1 bg-muted rounded-full overflow-hidden"><div className="h-full bg-accent rounded-full w-3/4"/></div><p className="text-[10px] text-muted-foreground text-center">Instant feedback at every step</p></div></div>}
    />),
    "gestalt-principles": (<DemoShell beforeLabel="No grouping" afterLabel="Clear groups"
      before={<div className="w-full p-5"><div className="flex flex-wrap gap-2 justify-center">{["Analytics","Users","Revenue","Support","Settings","Profile","Export","Import","Reports","Team","Billing","API"].map(item=><div key={item} className="border border-border px-2 py-1 rounded text-[10px] text-muted-foreground">{item}</div>)}</div></div>}
      after={<div className="w-full p-5"><div className="grid grid-cols-2 gap-3">{[{g:"Data",items:["Analytics","Reports","Export"]},{g:"People",items:["Users","Team","Support"]},{g:"Finance",items:["Revenue","Billing"]},{g:"System",items:["Settings","API","Profile"]}].map(group=><div key={group.g} className="bg-background rounded-lg p-3 border border-border"><div className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground mb-2">{group.g}</div><div className="flex flex-wrap gap-1">{group.items.map(i=><div key={i} className="text-[10px] px-2 py-0.5 bg-muted rounded text-foreground">{i}</div>)}</div></div>)}</div></div>}
    />),
    "temporal-discounting": (<DemoShell beforeLabel="Delayed benefit" afterLabel="Instant value"
      before={<div className="w-full p-8 text-center"><div className="text-2xl font-bold mb-2" style={{fontFamily:"Instrument Serif"}}>Start your 30-day trial</div><p className="text-xs text-muted-foreground mb-5">You'll see results in about a month of consistent use.</p><button className="bg-foreground text-background text-xs px-6 py-2.5 rounded-full">Start Trial</button></div>}
      after={<div className="w-full p-8 text-center"><div className="text-2xl font-bold mb-2" style={{fontFamily:"Instrument Serif"}}>Up and running in 5 minutes</div><p className="text-xs text-muted-foreground mb-2">Your first report is ready <strong>before you finish your coffee.</strong></p><div className="flex justify-center gap-3 mb-4 text-[10px] text-accent"><span>✓ No setup</span><span>✓ Import in one click</span><span>✓ Instant preview</span></div><button className="bg-foreground text-background text-xs px-6 py-2.5 rounded-full">See it now →</button></div>}
    />),
    "peak-end-rule": (<DemoShell beforeLabel="Flat completion" afterLabel="Peak moment"
      before={<div className="w-full p-8 text-center"><div className="text-4xl mb-3">✓</div><div className="text-sm font-medium">Done.</div><p className="text-xs text-muted-foreground mt-2">Report created.</p><button className="mt-5 text-xs text-muted-foreground underline">Back to dashboard</button></div>}
      after={<div className="w-full p-8 text-center"><motion.div animate={{scale:[1,1.2,1],rotate:[0,10,-10,0]}} transition={{duration:1,repeat:Infinity,repeatDelay:2}} className="text-4xl mb-3">🎉</motion.div><div className="text-lg font-bold mb-1" style={{fontFamily:"Instrument Serif"}}>Your report is live!</div><p className="text-xs text-muted-foreground mb-4">3,847 users can see it right now. Nice work.</p><div className="flex justify-center gap-2"><button className="bg-foreground text-background text-xs px-4 py-2 rounded-full">Share it</button><button className="border border-border text-xs px-4 py-2 rounded-full">View report</button></div></div>}
    />),
    "framing-effect": (<DemoShell beforeLabel="Neutral framing" afterLabel="Loss framing"
      before={<div className="w-full p-6 space-y-3"><div className="bg-background border border-border rounded-xl p-4 text-center"><div className="text-2xl font-bold mb-1">Pro Plan</div><div className="text-xs text-muted-foreground mb-3">Get additional storage and features</div><button className="bg-foreground text-background text-xs px-5 py-2 rounded-full">Upgrade to Pro</button></div></div>}
      after={<div className="w-full p-6 space-y-3"><div className="bg-foreground text-background rounded-xl p-4 text-center"><div className="text-xs font-mono opacity-50 mb-1">⚠ STORAGE NEARLY FULL</div><div className="text-lg font-bold mb-1" style={{fontFamily:"Instrument Serif"}}>Don't lose 3 years of work</div><div className="text-xs opacity-70 mb-3">Your files will be deleted in 7 days if you don't upgrade.</div><button className="bg-card text-foreground text-xs px-5 py-2 rounded-full font-medium">Protect my files</button></div></div>}
    />),
    "zeigarnik-effect": (<DemoShell beforeLabel="No progress" afterLabel="Progress visible"
      before={<div className="w-full p-6"><div className="bg-background rounded-xl border border-border p-4 max-w-xs mx-auto"><div className="font-medium text-sm mb-3">Your Profile</div><div className="flex items-center gap-3 mb-4"><div className="w-10 h-10 rounded-full bg-muted"/><div><div className="text-sm">Alex Kim</div><div className="text-xs text-muted-foreground">alex@company.com</div></div></div><div className="text-xs text-muted-foreground">Member since 2024</div></div></div>}
      after={<div className="w-full p-6"><div className="bg-background rounded-xl border border-border p-4 max-w-xs mx-auto"><div className="flex items-center justify-between mb-2"><div className="font-medium text-sm">Your Profile</div><div className="text-xs font-mono text-accent">65%</div></div><div className="h-1.5 bg-muted rounded-full overflow-hidden mb-3"><motion.div initial={{width:0}} animate={{width:"65%"}} transition={{duration:1,ease:"easeOut"}} className="h-full bg-accent rounded-full"/></div><div className="flex items-center gap-3 mb-3"><div className="w-10 h-10 rounded-full bg-muted"/><div><div className="text-sm">Alex Kim</div><div className="text-xs text-muted-foreground">alex@company.com</div></div></div><div className="space-y-1.5">{[{l:"Add bio",done:true},{l:"Upload photo",done:false},{l:"Link portfolio",done:false}].map(item=><div key={item.l} className="flex items-center gap-2 text-[11px]"><div className={`w-3 h-3 rounded-full flex items-center justify-center ${item.done?"bg-accent":"border border-muted-foreground"}`}>{item.done&&<span className="text-background text-[8px]">✓</span>}</div><span className={item.done?"text-muted-foreground line-through":"text-foreground"}>{item.l}</span></div>)}</div></div></div>}
    />),
    "reciprocity": (<DemoShell beforeLabel="Ask first" afterLabel="Give first"
      before={<div className="w-full p-8 text-center"><div className="text-xl font-bold mb-2" style={{fontFamily:"Instrument Serif"}}>Upgrade to Pro</div><p className="text-xs text-muted-foreground mb-5">Unlock all features for $29/month.</p><button className="bg-foreground text-background text-xs px-6 py-2.5 rounded-full">Start paying now</button></div>}
      after={<div className="w-full p-8 text-center"><div className="text-3xl mb-2">🎁</div><div className="text-xl font-bold mb-1" style={{fontFamily:"Instrument Serif"}}>Free for you, no strings</div><p className="text-xs text-muted-foreground mb-3">A complete guide to growing your audience. Yours to keep.</p><div className="inline-flex items-center gap-2 bg-card border border-border rounded-xl px-4 py-2 mb-4 text-xs"><span>📖</span><span className="font-medium">The Growth Playbook.pdf</span><span className="text-accent">↓</span></div><div className="block text-xs text-muted-foreground">Then, when ready: <span className="underline">explore Pro features</span></div></div>}
    />),
    "personalization": (<DemoShell beforeLabel="Generic welcome" afterLabel="Personalized welcome"
      before={<div className="w-full p-6"><div className="bg-background rounded-xl border border-border p-5 max-w-xs mx-auto"><div className="text-lg font-bold mb-1">Welcome back!</div><p className="text-xs text-muted-foreground mb-4">Here's what's new in the app this week.</p><div className="space-y-2">{["Feature update","New template library","Performance improvements"].map(i=><div key={i} className="text-xs flex items-center gap-2"><span className="text-accent">•</span>{i}</div>)}</div></div></div>}
      after={<div className="w-full p-6"><div className="bg-background rounded-xl border border-border p-5 max-w-xs mx-auto"><div className="flex items-center gap-2 mb-3"><div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center text-xs font-bold text-accent">S</div><div className="text-[10px] text-muted-foreground">Good morning, Sarah</div></div><div className="text-base font-bold mb-1" style={{fontFamily:"Instrument Serif"}}>Your team shipped 3 reports this week</div><p className="text-[11px] text-muted-foreground mb-3">You're 2 approvals away from your monthly goal.</p><div className="bg-card rounded-lg px-3 py-2 text-[11px]"><span className="font-medium">Suggested:</span> Review Q4 marketing brief →</div></div></div>}
    />),
    "emotional-design": (<DemoShell beforeLabel="Cold error" afterLabel="Human error"
      before={<div className="w-full p-8 text-center"><div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-3 text-xl">✕</div><div className="text-sm font-medium text-destructive mb-1">ERROR: 422 Unprocessable Entity</div><p className="text-xs text-muted-foreground mb-4">Request validation failed. Check input parameters.</p><button className="text-xs underline text-muted-foreground">Retry</button></div>}
      after={<div className="w-full p-8 text-center"><motion.div animate={{rotate:[-5,5,-5]}} transition={{duration:1,repeat:Infinity}} className="text-4xl mb-3">😬</motion.div><div className="text-base font-bold mb-1" style={{fontFamily:"Instrument Serif"}}>Oops — something got tangled</div><p className="text-xs text-muted-foreground mb-4">It's not you, it's us. We logged the issue and are looking into it.</p><div className="flex justify-center gap-2"><button className="bg-foreground text-background text-xs px-4 py-2 rounded-full">Try again</button><button className="border border-border text-xs px-4 py-2 rounded-full">Contact us</button></div></div>}
    />),
    "habit-formation": (<DemoShell beforeLabel="No streak" afterLabel="Streak active"
      before={<div className="w-full p-6"><div className="bg-background rounded-xl border border-border p-5 max-w-xs mx-auto text-center"><div className="text-sm font-medium mb-2">Today's practice</div><p className="text-xs text-muted-foreground mb-5">Complete your daily vocabulary session.</p><button className="bg-foreground text-background text-xs px-6 py-2.5 rounded-full">Start session</button></div></div>}
      after={<div className="w-full p-6"><div className="bg-background rounded-xl border border-border p-5 max-w-xs mx-auto"><div className="flex items-center justify-between mb-4"><div className="text-sm font-medium">Today's practice</div><div className="flex items-center gap-1 text-xs font-mono bg-card px-2 py-1 rounded-full"><span>🔥</span><span className="font-bold">14</span><span className="text-muted-foreground">day streak</span></div></div><div className="flex gap-1 mb-4">{Array.from({length:7}).map((_,i)=><div key={i} className={`flex-1 h-6 rounded ${i<6?"bg-accent":"bg-muted border border-accent"} flex items-center justify-center text-[9px] ${i<6?"text-background":"text-accent"}`}>{i<6?"✓":"→"}</div>)}</div><button className="w-full bg-foreground text-background text-xs py-2.5 rounded-full">Keep your streak alive →</button></div></div>}
    />),
    "anchoring-bias": (<DemoShell beforeLabel="Flat options" afterLabel="Anchored options"
      before={<div className="w-full p-5"><div className="grid grid-cols-3 gap-3">{[{n:"Basic",p:"$9"},{n:"Pro",p:"$29"},{n:"Team",p:"$79"}].map(t=><div key={t.n} className="border border-border p-4 rounded-xl text-center text-xs"><div className="font-medium">{t.n}</div><div className="text-xl font-bold my-1">{t.p}</div><div className="text-muted-foreground text-[10px]">/month</div></div>)}</div></div>}
      after={<div className="w-full p-5"><div className="grid grid-cols-3 gap-3">{[{n:"Enterprise",p:"$299",big:true,sub:"Most powerful"},{n:"Pro",p:"$79",d:"Best value",rec:true},{n:"Starter",p:"$19",d:"Get started"}].map(t=><div key={t.n} className={`p-3 rounded-xl border text-center text-xs ${t.big?"border-muted bg-background opacity-70":t.rec?"border-foreground bg-foreground text-background":"border-border"}`}>{t.sub&&<div className="text-[8px] font-mono mb-1 opacity-60">{t.sub}</div>}<div className="font-semibold text-[11px]">{t.n}</div><div className="text-base font-bold my-1">{t.p}</div><div className={`text-[9px] ${t.rec?"opacity-70":"text-muted-foreground"}`}>{t.d||""}</div></div>)}</div></div>}
    />),
    "loss-aversion": (<DemoShell beforeLabel="Gain framing" afterLabel="Loss framing"
      before={<div className="w-full p-8 text-center"><div className="text-xl font-bold mb-2" style={{fontFamily:"Instrument Serif"}}>Upgrade to Pro</div><p className="text-xs text-muted-foreground mb-5">Get 100GB storage and advanced analytics.</p><button className="bg-foreground text-background text-xs px-6 py-2.5 rounded-full">Upgrade now</button></div>}
      after={<div className="w-full p-6"><div className="bg-background rounded-xl border border-border overflow-hidden max-w-xs mx-auto"><div className="bg-foreground text-background px-4 py-2 text-[10px] font-mono flex items-center gap-2"><span>⚠</span> Trial expires in <strong>3 days</strong></div><div className="p-4 text-center"><div className="text-lg font-bold mb-1" style={{fontFamily:"Instrument Serif"}}>Don't lose your work</div><p className="text-[11px] text-muted-foreground mb-3">6 months of reports will be deleted when your trial ends.</p><button className="bg-foreground text-background text-xs px-5 py-2 rounded-full w-full">Keep my data — Upgrade</button><div className="text-[9px] text-muted-foreground mt-2">or let everything be deleted</div></div></div></div>}
    />),
    "social-proof": (<DemoShell beforeLabel="No social proof" afterLabel="With social proof"
      before={<div className="w-full p-8 text-center"><div className="text-xl font-bold mb-2" style={{fontFamily:"Instrument Serif"}}>Try it free for 14 days</div><p className="text-xs text-muted-foreground mb-5">No credit card required.</p><button className="bg-foreground text-background text-xs px-6 py-2.5 rounded-full">Get started</button></div>}
      after={<div className="w-full p-6"><div className="text-center mb-4"><div className="flex justify-center gap-1 mb-1">{[...Array(5)].map((_,i)=><span key={i} className="text-accent">★</span>)}</div><div className="text-xs font-medium">4.9 out of 5</div><div className="text-[10px] text-muted-foreground">From 2,841 reviews</div></div><div className="flex justify-center gap-3 mb-4 opacity-50">{["STRIPE","NOTION","LINEAR","VERCEL"].map(b=><div key={b} className="text-[9px] font-mono font-bold tracking-widest">{b}</div>)}</div><div className="bg-background rounded-xl border border-border p-3 text-[11px] mb-3"><div className="font-medium mb-1">"Shipped our onboarding in a week"</div><div className="text-muted-foreground">— Maya T., Head of Product at Finch</div></div><div className="text-center text-[10px] text-muted-foreground"><span className="font-bold text-foreground">23 people</span> signed up in the last hour</div></div>}
    />),
    "decision-fatigue": (<DemoShell beforeLabel="All options exposed" afterLabel="Smart default"
      before={<div className="w-full p-5"><div className="text-xs font-medium mb-3">Configure your workspace:</div><div className="space-y-2">{["Choose theme (12 options)","Select sidebar layout (6 options)","Configure notifications (18 options)","Set timezone (400+ options)","Choose date format (8 options)","Privacy level (5 options)"].map(item=><div key={item} className="flex items-center justify-between border border-border rounded px-3 py-2 text-[10px]"><span className="text-muted-foreground">{item}</span><span className="text-accent">▾</span></div>)}</div></div>}
      after={<div className="w-full p-7 text-center"><div className="text-3xl mb-3">✨</div><div className="text-base font-bold mb-1" style={{fontFamily:"Instrument Serif"}}>You're all set</div><p className="text-xs text-muted-foreground mb-4">We've configured everything based on how your team works. Adjust anytime.</p><button className="bg-foreground text-background text-xs px-6 py-2.5 rounded-full mb-3">Take me in</button><div className="text-[10px] text-muted-foreground underline">Customize settings →</div></div>}
    />),
    "cognitive-load": (<DemoShell beforeLabel="One long form" afterLabel="Step-by-step"
      before={<div className="w-full p-5"><div className="text-xs font-medium mb-3">Create your account:</div><div className="space-y-2">{["Full name","Email address","Password","Confirm password","Company name","Company size","Job title","Department","Phone number","Referral code"].map(f=><div key={f} className="border border-border rounded px-3 py-1.5 text-[10px] text-muted-foreground bg-background">{f}</div>)}<button className="w-full bg-foreground text-background text-xs py-2 rounded mt-1">Create account</button></div></div>}
      after={<div className="w-full p-6"><div className="flex items-center gap-2 mb-5">{[1,2,3].map((s,i)=><div key={s} className="flex items-center gap-2"><div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-medium ${i===0?"bg-foreground text-background":"border border-muted-foreground text-muted-foreground"}`}>{s}</div>{i<2&&<div className="flex-1 h-px bg-border w-8"/>}</div>)}<div className="ml-auto text-[10px] text-muted-foreground">Step 1 of 3</div></div><div className="text-sm font-medium mb-3">Basic info</div><div className="space-y-2 mb-4">{["Full name","Email address","Password"].map(f=><div key={f} className="border border-border rounded-lg px-3 py-2 text-xs text-muted-foreground bg-background">{f}</div>)}</div><button className="w-full bg-foreground text-background text-xs py-2.5 rounded-full">Continue →</button></div>}
    />),
  };
  return <div className="w-full">{demos[patternId] || (<DemoShell before={<div className="p-8 text-center text-sm text-muted-foreground">Before: Without this pattern</div>} after={<div className="p-8 text-center text-sm text-muted-foreground">After: With this pattern applied</div>} />)}</div>;
}

// ─── Floating Network Card (physics-driven, ref-based positioning) ─────────────

const FloatingNetworkCard = forwardRef<HTMLDivElement, {
  pattern: Pattern;
  onClick: () => void;
}>(({ pattern, onClick }, ref) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      ref={ref}
      className="absolute cursor-pointer"
      style={{ transform: "translate(-50%, -50%)" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
    >
      <motion.div
        animate={{ width: hovered ? 230 : 152 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className="rounded-xl border border-border shadow-sm overflow-hidden"
        style={{ background: "#E4E6C3", minWidth: 152 }}
      >
        <div className="p-3">
          <div className="text-[9px] font-mono uppercase tracking-widest mb-1" style={{ color: "#899878" }}>
            {pattern.category}
          </div>
          <div className="font-medium leading-tight text-[13px]" style={{ fontFamily: "Tipo Movin CDMX, sans-serif", color: "#222725" }}>
            {pattern.name}
          </div>
          {hovered && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.15 }} className="mt-2">
              <p className="text-[11px] leading-relaxed" style={{ color: "#666d62" }}>{pattern.tagline}</p>
              <div className="mt-2 text-[10px] flex items-center gap-1" style={{ color: "#899878" }}>Click to explore →</div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
});
FloatingNetworkCard.displayName = "FloatingNetworkCard";

// ─── Physics Canvas ───────────────────────────────────────────────────────────

function FloatingCanvas({ speedTarget, onPatternClick }: {
  speedTarget: number;
  onPatternClick: (pattern: Pattern) => void;
}) {
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const speedTargetRef = useRef(speedTarget);

  useEffect(() => { speedTargetRef.current = speedTarget; }, [speedTarget]);

  const physicsRef = useRef(() => {
    const W = typeof window !== "undefined" ? window.innerWidth : 1200;
    const H = typeof window !== "undefined" ? window.innerHeight : 800;
    return {
      states: PATTERNS.map((_, i) => {
        const cols = 6, rows = 3;
        const col = i % cols, row = Math.floor(i / cols);
        return {
          x: ((col + 0.5) / cols) * (W * 0.82) + W * 0.09 + (Math.sin(i * 3.1) * 35),
          y: ((row + 0.5) / rows) * (H * 0.55) + 60 + (Math.cos(i * 2.7) * 25),
          vx: (Math.sin(i * 7.3) - 0.5) * 0.45,
          vy: (Math.cos(i * 5.1) - 0.5) * 0.35,
        };
      }),
      currentSpeed: 0.5,
    };
  });

  // Init once
  const stateRef = useRef(physicsRef.current());

  useEffect(() => {
    let animId: number;
    const loop = () => {
      const st = stateRef.current;
      // Smooth speed interpolation
      st.currentSpeed += (speedTargetRef.current - st.currentSpeed) * 0.035;
      const maxV = st.currentSpeed;
      const minV = maxV * 0.18;
      const pertStr = maxV * 0.09;
      const W = window.innerWidth, H = window.innerHeight;
      const minX = 82, maxX = W - 82, minY = 52, maxY = H - 148;

      st.states.forEach((s, i) => {
        s.vx += (Math.random() - 0.5) * pertStr;
        s.vy += (Math.random() - 0.5) * pertStr;
        const spd = Math.sqrt(s.vx * s.vx + s.vy * s.vy);
        if (spd > maxV && spd > 0) { s.vx *= maxV / spd; s.vy *= maxV / spd; }
        else if (spd < minV && spd > 0.0001) { s.vx *= minV / spd; s.vy *= minV / spd; }
        s.x += s.vx; s.y += s.vy;
        if (s.x < minX) { s.x = minX; s.vx = Math.abs(s.vx); }
        if (s.x > maxX) { s.x = maxX; s.vx = -Math.abs(s.vx); }
        if (s.y < minY) { s.y = minY; s.vy = Math.abs(s.vy); }
        if (s.y > maxY) { s.y = maxY; s.vy = -Math.abs(s.vy); }
        const el = cardRefs.current[i];
        if (el) { el.style.left = s.x + "px"; el.style.top = s.y + "px"; }
      });
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div className="absolute inset-0">
      {PATTERNS.map((pattern, i) => (
        <FloatingNetworkCard
          key={pattern.id}
          ref={(el) => { cardRefs.current[i] = el; }}
          pattern={pattern}
          onClick={() => onPatternClick(pattern)}
        />
      ))}
    </div>
  );
}

// ─── Chat Input Panel ─────────────────────────────────────────────────────────

function ChatInputPanel({ onSubmit, isProcessing, placeholder }: {
  onSubmit: (text: string) => void;
  isProcessing: boolean;
  placeholder: string;
}) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    if (value.trim() && !isProcessing) {
      onSubmit(value.trim());
      setValue("");
    }
  };

  return (
    <div className="px-4 py-3">
      <motion.div
        className="rounded-2xl border border-border overflow-hidden"
        animate={{ boxShadow: isProcessing ? "0 0 0 2px #899878, 0 8px 32px rgba(137,152,120,0.25)" : "0 2px 16px rgba(18,17,19,0.06)" }}
        style={{ background: "#F7F7F2" }}
      >
        <div className="flex items-center gap-3 px-4 py-3">
          <motion.div animate={{ rotate: isProcessing ? 360 : 0 }} transition={{ duration: 1.5, repeat: isProcessing ? Infinity : 0, ease: "linear" }}>
            <Sparkles size={14} style={{ color: "#899878" }} />
          </motion.div>
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder={isProcessing ? "Analyzing patterns…" : placeholder}
            disabled={isProcessing}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            style={{ color: "#121113" }}
          />
          <button
            onClick={handleSubmit}
            disabled={!value.trim() || isProcessing}
            className="w-7 h-7 rounded-full flex items-center justify-center disabled:opacity-30 transition-opacity shrink-0"
            style={{ background: "#222725" }}
          >
            <Send size={11} color="#F7F7F2" />
          </button>
        </div>
        {isProcessing && (
          <div className="h-0.5 overflow-hidden" style={{ background: "#E4E6C3" }}>
            <motion.div className="h-full" style={{ background: "#899878" }} animate={{ x: ["-100%", "200%"] }} transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }} />
          </div>
        )}
      </motion.div>
    </div>
  );
}

// ─── Results Pattern Card ─────────────────────────────────────────────────────

function ResultsPatternCard({ pattern, rank, isTop, onClick }: {
  pattern: Pattern; rank?: number; isTop: boolean; onClick: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.38, delay: isTop && rank ? (rank - 1) * 0.08 : 0.1, ease: "easeOut" }}
      whileHover={{ scale: 1.02, boxShadow: "0 8px 28px rgba(18,17,19,0.09)" }}
      className="cursor-pointer rounded-2xl border overflow-hidden transition-shadow"
      style={{ background: isTop ? "#E4E6C3" : "#eeeed9", borderColor: isTop ? "rgba(34,39,37,0.18)" : "rgba(34,39,37,0.1)" }}
      onClick={onClick}
    >
      <div className={`p-${isTop ? "5" : "4"}`} style={{ padding: isTop ? "20px" : "14px" }}>
        {isTop && rank && (
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0" style={{ background: "#222725", color: "#F7F7F2" }}>{rank}</div>
            <div className="text-[9px] font-mono uppercase tracking-widest" style={{ color: "#899878" }}>Top Pick</div>
          </div>
        )}
        <div className="text-[9px] font-mono uppercase tracking-widest mb-1.5" style={{ color: "#899878" }}>{pattern.category}</div>
        <div className="font-medium leading-tight mb-2" style={{ fontFamily: "Instrument Serif, serif", color: "#222725", fontSize: isTop ? "18px" : "13px" }}>{pattern.name}</div>
        {isTop && <p className="text-xs leading-relaxed" style={{ color: "#666d62" }}>{pattern.tagline}</p>}
      </div>
    </motion.div>
  );
}

// ─── Network View ─────────────────────────────────────────────────────────────

function NetworkView({ onPatternSelect, onTopPatternsChange }: {
  onPatternSelect: (pattern: Pattern, allPatterns: Pattern[], userContext: string) => void;
  onTopPatternsChange: (patterns: Pattern[]) => void;
}) {
  const [layoutMode, setLayoutMode] = useState<LayoutMode>("floating");
  const [speedTarget, setSpeedTarget] = useState(0.5);
  const [topPatterns, setTopPatterns] = useState<Pattern[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const buildOrderedPatterns = (top3: Pattern[]) => {
    const topIds = new Set(top3.map((p) => p.id));
    return [...top3, ...PATTERNS.filter((p) => !topIds.has(p.id))];
  };

  const handleInitialQuery = (query: string) => {
    setMessages([{ role: "user", content: query }]);
    setLayoutMode("thinking");
    setSpeedTarget(3.8);

    setTimeout(() => {
      setSpeedTarget(0.18); // slow down
      const top3 = scorePatterns(query, PATTERNS);
      const explanation = generateExplanation(query, top3);
      setTimeout(() => {
        setTopPatterns(top3);
        onTopPatternsChange(top3);
        setMessages([{ role: "user", content: query }, { role: "ai", content: explanation }]);
        setLayoutMode("results");
      }, 680);
    }, 2100);
  };

  const handleFollowUp = (text: string) => {
    const next = [...messages, { role: "user" as const, content: text }];
    setMessages(next);
    setIsProcessing(true);
    setTimeout(() => {
      const allUserText = next.filter((m) => m.role === "user").map((m) => m.content).join(" ");
      const top3 = scorePatterns(allUserText, PATTERNS);
      const explanation = generateExplanation(text, top3);
      setTopPatterns(top3);
      onTopPatternsChange(top3);
      setMessages([...next, { role: "ai", content: explanation }]);
      setIsProcessing(false);
    }, 1500);
  };

  const handleCardClick = (pattern: Pattern) => {
    const ordered = topPatterns.length > 0 ? buildOrderedPatterns(topPatterns) : PATTERNS;
    const userQueryContext = messages.filter((m) => m.role === "user").map((m) => m.content).join(". ");
    onPatternSelect(pattern, ordered, userQueryContext);
  };

  const otherPatterns = PATTERNS.filter((p) => !topPatterns.some((t) => t.id === p.id));

  return (
    <div className="relative w-full h-screen overflow-hidden" style={{ background: "#F7F7F2" }}>
      {/* Logo */}
      <div className="absolute top-6 left-8 z-30">
        <span style={{ fontFamily: "Valve, sans-serif", fontSize: 20, color: "#121113" }}>NUDGE</span>
      </div>

      <AnimatePresence mode="wait">
        {layoutMode !== "results" ? (
          <motion.div key="floating" className="absolute inset-0" exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
            {/* Dot grid */}
            <div className="absolute inset-0 opacity-[0.18] pointer-events-none" style={{ backgroundImage: "radial-gradient(circle, #899878 1px, transparent 1px)", backgroundSize: "42px 42px" }} />
            <FloatingCanvas speedTarget={speedTarget} onPatternClick={handleCardClick} />
            <div className="absolute bottom-0 left-0 right-0 z-20">
              <div className="max-w-xl mx-auto">
                <ChatInputPanel onSubmit={handleInitialQuery} isProcessing={layoutMode === "thinking"} placeholder="Describe your product or UX challenge to get pattern recommendations…" />
                {layoutMode === "floating" && (
                  <p className="text-center text-xs pb-3" style={{ color: "#b0b89e" }}>
                    Hover cards to preview · click to explore · AI finds your top patterns
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div key="results" className="absolute inset-0 flex flex-col" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            {/* Reset button */}
            <div className="absolute top-6 right-8 z-20">
              <button
                onClick={() => { setLayoutMode("floating"); setSpeedTarget(0.5); setTopPatterns([]); setMessages([]); onTopPatternsChange([]); }}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-border transition-colors hover:bg-card"
                style={{ color: "#899878" }}
              >
                <RotateCcw size={10} /> New search
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto">
              <div className="max-w-2xl mx-auto px-6 pt-14 pb-6">
                {/* AI explanation */}
                <div className="text-[10px] font-mono uppercase tracking-widest mb-4" style={{ color: "#899878" }}>Conversation</div>
                <div className="space-y-5">
                  {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                      {msg.role === "user" ? (
                        <div className="rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm max-w-sm leading-relaxed" style={{ background: "#E4E6C3", color: "#222725" }}>
                          {msg.content}
                        </div>
                      ) : (
                        <div className="text-sm leading-relaxed max-w-lg" style={{ color: "#333530" }}>
                          <FormattedText text={msg.content} />
                        </div>
                      )}
                    </div>
                  ))}
                  {isProcessing && (
                    <div className="flex items-center gap-2 text-xs" style={{ color: "#899878" }}>
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                        <Sparkles size={12} />
                      </motion.div>
                      Updating recommendations…
                    </div>
                  )}
                </div>
              </div>

              {/* Top 3 */}
              <div className="max-w-3xl mx-auto px-6 pb-8">
                <div className="text-[10px] font-mono uppercase tracking-widest mb-4" style={{ color: "#899878" }}>Top Recommendations</div>
                <div className="grid grid-cols-3 gap-5">
                  {topPatterns.map((p, i) => (
                    <ResultsPatternCard key={p.id} pattern={p} rank={i + 1} isTop onClick={() => handleCardClick(p)} />
                  ))}
                </div>
              </div>

              {/* Other patterns */}
              <div className="max-w-3xl mx-auto px-6 pb-12">
                <div className="text-[10px] font-mono uppercase tracking-widest mb-4 flex items-center gap-3" style={{ color: "#899878" }}>
                  Other patterns to consider
                  <div className="flex-1 h-px" style={{ background: "rgba(137,152,120,0.25)" }} />
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {otherPatterns.map((p) => (
                    <ResultsPatternCard key={p.id} pattern={p} isTop={false} onClick={() => handleCardClick(p)} />
                  ))}
                </div>
              </div>
            </div>

            {/* Sticky chat */}
            <div className="shrink-0 border-t border-border" style={{ background: "#F7F7F2" }}>
              <div className="max-w-xl mx-auto">
                <ChatInputPanel onSubmit={handleFollowUp} isProcessing={isProcessing} placeholder="Ask a follow-up about your project…" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Detail View ──────────────────────────────────────────────────────────────

function DetailView({ pattern, allPatterns, topPatterns, currentIndex, fromResults, userContext, onBack, onNavigate }: {
  pattern: Pattern;
  allPatterns: Pattern[];
  topPatterns: Pattern[];
  currentIndex: number;
  fromResults: boolean;
  userContext: string;
  onBack: () => void;
  onNavigate: (p: Pattern, idx: number) => void;
}) {
  const topIds = new Set(topPatterns.map((p) => p.id));
  const isTop = topIds.has(pattern.id);
  const rank = topPatterns.findIndex((p) => p.id === pattern.id) + 1;
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < allPatterns.length - 1;

  return (
    <motion.div className="min-h-screen" style={{ background: "#F7F7F2" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      {/* Sticky header */}
      <div className="sticky top-0 z-10 px-6 py-4 border-b border-border flex items-center justify-between" style={{ background: "#F7F7F2" }}>
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm transition-colors hover:text-foreground" style={{ color: "#899878" }}>
          <ChevronLeft size={14} />
          {fromResults ? "Back to results" : "Pattern network"}
        </button>
        <div className="flex items-center gap-2">
          {isTop && rank > 0 ? (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium" style={{ background: "#E4E6C3", color: "#222725" }}>
              <span>★</span> Top Pick #{rank}
            </div>
          ) : topPatterns.length > 0 ? (
            <div className="text-xs px-3 py-1 rounded-full border border-border" style={{ color: "#899878" }}>
              Secondary pattern
            </div>
          ) : null}
          <div className="text-[10px] font-mono uppercase tracking-widest px-3 py-1 rounded-full" style={{ background: "#E4E6C3", color: "#899878" }}>
            {pattern.category}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-8 py-12 pb-32">
        <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.05 }} className="leading-none mb-3" style={{ fontFamily: "Instrument Serif, serif", fontSize: "clamp(40px, 6vw, 64px)", color: "#121113", fontWeight: 400 }}>
          {pattern.name}
        </motion.h1>
        <motion.p initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="text-xl mb-2" style={{ fontFamily: "Instrument Serif, serif", color: "#899878", fontStyle: "italic" }}>
          {pattern.tagline}
        </motion.p>

        <div className="h-px my-10 border-border" style={{ background: "rgba(34,39,37,0.12)" }} />

        {userContext && (
          <motion.div initial={{ y: 14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.09 }} className="rounded-2xl p-6 mb-10 border" style={{ background: "rgba(137,152,120,0.08)", borderColor: "rgba(137,152,120,0.28)" }}>
            <div className="text-[10px] font-mono uppercase tracking-widest mb-3" style={{ color: "#899878" }}>For your project</div>
            <div className="text-sm leading-relaxed" style={{ color: "#333530" }}>
              <FormattedText text={generatePatternInsight(pattern, userContext)} />
            </div>
          </motion.div>
        )}

        <motion.div initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.12 }} className="grid md:grid-cols-2 gap-8 mb-12">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest mb-3" style={{ color: "#899878" }}>What it is</div>
            <p className="text-sm leading-relaxed" style={{ color: "#333530" }}>{pattern.description}</p>
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest mb-3" style={{ color: "#899878" }}>How to apply</div>
            <p className="text-sm leading-relaxed mb-4" style={{ color: "#333530" }}>{pattern.how}</p>
            <ul className="space-y-1.5">
              {pattern.examples.map((ex) => (
                <li key={ex} className="flex items-start gap-2 text-sm" style={{ color: "#666d62" }}>
                  <span className="mt-0.5 shrink-0" style={{ color: "#899878" }}>→</span>{ex}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>

        <motion.div initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.16 }} className="rounded-2xl p-6 mb-12 border border-border" style={{ background: "#E4E6C3" }}>
          <div className="text-[10px] font-mono uppercase tracking-widest mb-3" style={{ color: "#899878" }}>Real-world example</div>
          <p className="text-sm leading-relaxed" style={{ color: "#222725" }}>{pattern.productExample}</p>
        </motion.div>

        <motion.div initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
          <div className="text-[10px] font-mono uppercase tracking-widest mb-5" style={{ color: "#899878" }}>Interactive demo</div>
          <PatternDemo patternId={pattern.id} />
        </motion.div>
      </div>

      {/* Fixed prev/next navigation */}
      <div className="fixed bottom-8 left-0 right-0 flex items-center justify-center gap-4 z-20 pointer-events-none">
        <button
          onClick={() => hasPrev && onNavigate(allPatterns[currentIndex - 1], currentIndex - 1)}
          disabled={!hasPrev}
          className="pointer-events-auto flex items-center gap-2 text-sm px-4 py-2 rounded-full border border-border shadow-md transition-all disabled:opacity-25 hover:bg-card"
          style={{ background: "#F7F7F2" }}
        >
          <ChevronLeft size={14} /> Prev
        </button>
        <div className="pointer-events-auto text-xs font-mono px-4 py-2 rounded-full border border-border shadow-md" style={{ background: "#F7F7F2", color: "#899878" }}>
          {currentIndex + 1} / {allPatterns.length}
        </div>
        <button
          onClick={() => hasNext && onNavigate(allPatterns[currentIndex + 1], currentIndex + 1)}
          disabled={!hasNext}
          className="pointer-events-auto flex items-center gap-2 text-sm px-4 py-2 rounded-full border border-border shadow-md transition-all disabled:opacity-25 hover:bg-card"
          style={{ background: "#F7F7F2" }}
        >
          Next <ChevronRight size={14} />
        </button>
      </div>
    </motion.div>
  );
}

// ─── Landing View ─────────────────────────────────────────────────────────────

function LandingView({ onEnter }: { onEnter: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div className="w-full h-screen flex flex-col items-center justify-center cursor-pointer select-none relative overflow-hidden" style={{ background: "#F7F7F2" }} onClick={onEnter} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <div className="absolute inset-0 opacity-[0.18] pointer-events-none" style={{ backgroundImage: "radial-gradient(circle, #899878 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
      <motion.div className="text-center relative" animate={{ y: hovered ? -5 : 0 }} transition={{ duration: 0.4, ease: "easeOut" }}>
        <h1 className="tracking-tight leading-none mb-5" style={{ fontFamily: "Valve, sans-serif", fontSize: "clamp(88px, 19vw, 196px)", color: "#121113", fontWeight: 400 }}>
          NUDGE
        </h1>
        <motion.p className="text-sm tracking-widest font-mono uppercase" style={{ color: "#899878" }} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          Behavioral design patterns
        </motion.p>
        <motion.div className="mt-10 flex items-center justify-center gap-2 text-xs" style={{ color: "#899878" }} animate={{ opacity: hovered ? 1 : 0.45 }}>
          <span>Click to enter</span>
          <motion.span animate={{ x: hovered ? 4 : 0 }} transition={{ duration: 0.3 }}>→</motion.span>
        </motion.div>
      </motion.div>
      <div className="absolute bottom-8 left-8 text-[10px] font-mono" style={{ color: "#c8caa8" }}>18 patterns</div>
      <div className="absolute bottom-8 right-8 text-[10px] font-mono" style={{ color: "#c8caa8" }}>AI-powered</div>
    </motion.div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [scene, setScene] = useState<Scene>("landing");
  const [topPatterns, setTopPatterns] = useState<Pattern[]>([]);
  const [selectedPattern, setSelectedPattern] = useState<Pattern | null>(null);
  const [allPatterns, setAllPatterns] = useState<Pattern[]>(PATTERNS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fromResults, setFromResults] = useState(false);
  const [userContext, setUserContext] = useState("");

  const handlePatternSelect = (pattern: Pattern, ordered: Pattern[], context: string) => {
    setSelectedPattern(pattern);
    setAllPatterns(ordered);
    setCurrentIndex(ordered.findIndex((p) => p.id === pattern.id));
    setFromResults(topPatterns.length > 0);
    setUserContext(context);
    setScene("detail");
  };

  const handleNavigate = (pattern: Pattern, idx: number) => {
    setSelectedPattern(pattern);
    setCurrentIndex(idx);
  };

  return (
    <div className="w-full min-h-screen relative" style={{ fontFamily: "DM Sans, sans-serif" }}>
      <AnimatePresence>
        {scene === "landing" && (
          <motion.div key="landing" className="absolute inset-0 z-30" exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
            <LandingView onEnter={() => setScene("network")} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* NetworkView — always mounted once past landing, visibility toggled */}
      {scene !== "landing" && (
        <motion.div
          className="absolute inset-0"
          animate={{ opacity: scene === "network" ? 1 : 0, pointerEvents: scene === "network" ? "auto" : "none" } as never}
          transition={{ duration: 0.3 }}
        >
          <NetworkView onPatternSelect={handlePatternSelect} onTopPatternsChange={setTopPatterns} />
        </motion.div>
      )}

      <AnimatePresence>
        {scene === "detail" && selectedPattern && (
          <motion.div key={`detail-${selectedPattern.id}`} className="absolute inset-0 overflow-y-auto z-20" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            <DetailView
              pattern={selectedPattern}
              allPatterns={allPatterns}
              topPatterns={topPatterns}
              currentIndex={currentIndex}
              fromResults={fromResults}
              userContext={userContext}
              onBack={() => setScene("network")}
              onNavigate={handleNavigate}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

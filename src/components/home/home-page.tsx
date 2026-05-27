"use client"

import Link from "next/link"
import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { HomeNav } from "@/components/layout/home-nav"
import { Logo, APP_NAME } from "@/components/shared/logo"
import type { Session } from "@/lib/auth"
import {
  ArrowRight, Mic, Brain, FileText, BarChart3, Zap,
  CheckCircle2, CheckCheck, Code2, Timer, Star
} from "lucide-react"

interface HomePageProps {
  session: Session | null
}

import type { Variants } from "framer-motion"

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
}

const stagger: Variants = { show: { transition: { staggerChildren: 0.1 } } }

// ─── Features ─────────────────────────────────────────────────────────────────
const FEATURES = [
  { icon: FileText, title: "Resume-Aware Questions", desc: "Upload your PDF or DOCX. We extract your exact projects and tech stack to ask questions only relevant to you — not generic practice problems." },
  { icon: Mic, title: "Voice-First, Interrupt Freely", desc: "Speak naturally. The AI hears you. Even mid-sentence. The conversation flows like a real phone screen — no awkward button presses." },
  { icon: Brain, title: "Adaptive Intelligence", desc: "Strong answer? The AI goes deeper. Weak answer? It probes fundamentals. Every session is uniquely calibrated to your level." },
  { icon: Code2, title: "Practical Activities", desc: "Debug real code. Predict JS output. Defend your resume claims. Not just theory — the same challenges top companies actually use." },
  { icon: BarChart3, title: "Honest Scoring", desc: "50 = average. 85 = strong. 90+ = rare. Scores are calibrated to match real interview standards — not inflated to make you feel good." },
  { icon: Zap, title: "Actionable Learning Plan", desc: "Weak areas become specific prompts you can paste into ChatGPT or Claude for targeted practice. No vague 'study more JavaScript.'" },
]

// ─── Pricing ──────────────────────────────────────────────────────────────────
const PLANS = {
  monthly: [
    {
      name: "Free Trial",
      price: "₹0",
      period: "one session",
      description: "Try the full interview experience once, no card required.",
      features: ["1 AI interview session", "Voice + text + code modes", "Basic performance report", "Resume parsing"],
      cta: "Start free →",
      href: "/register",
      highlight: false,
    },
    {
      name: "Pro",
      price: "₹699",
      period: "/ month",
      badge: "Most Popular",
      description: "Unlimited practice for serious candidates preparing to crack their next role.",
      features: ["Unlimited AI interviews", "Deep analytics & scoring", "All 7 activity types", "Learning prompts library", "Interview history & trends", "Priority support"],
      cta: "Get Pro →",
      href: "/register",
      highlight: true,
    },
    {
      name: "Intensive",
      price: "₹1,499",
      period: "/ month",
      description: "For candidates with active offers on the table and a 2-week deadline.",
      features: ["Everything in Pro", "Daily session reminders", "Mock offer letter evaluation", "Salary negotiation prep", "WhatsApp support"],
      cta: "Go Intensive →",
      href: "/register",
      highlight: false,
    },
  ],
  yearly: [
    {
      name: "Free Trial",
      price: "₹0",
      period: "one session",
      description: "Try the full interview experience once, no card required.",
      features: ["1 AI interview session", "Voice + text + code modes", "Basic performance report", "Resume parsing"],
      cta: "Start free →",
      href: "/register",
      highlight: false,
    },
    {
      name: "Pro",
      price: "₹499",
      period: "/ month",
      badge: "Save 28%",
      description: "Billed annually. Best for 3-6 month job search cycles.",
      features: ["Unlimited AI interviews", "Deep analytics & scoring", "All 7 activity types", "Learning prompts library", "Interview history & trends", "Priority support"],
      cta: "Get Pro Yearly →",
      href: "/register",
      highlight: true,
    },
    {
      name: "Intensive",
      price: "₹1,099",
      period: "/ month",
      description: "Billed annually. For serious candidates who interview often.",
      features: ["Everything in Pro", "Daily session reminders", "Mock offer letter evaluation", "Salary negotiation prep", "WhatsApp support"],
      cta: "Go Intensive →",
      href: "/register",
      highlight: false,
    },
  ],
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────
const FAQ = [
  {
    q: "How is Foxtel different from mock interview websites?",
    a: "Most platforms give you a list of standard LeetCode-style questions. Foxtel reads your actual resume, references your projects by name, and builds a unique interview plan for your specific target role. The questions you get are the ones you'd actually face with your background.",
  },
  {
    q: "Can I interrupt the AI while it's speaking?",
    a: "Yes — this is a core feature. Just start talking. The AI will stop immediately and respond to what you said, naturally. It's designed to feel like a real conversation, not a scripted Q&A.",
  },
  {
    q: "What tech stacks does Foxtel support?",
    a: "JavaScript / TypeScript (React, Node, Next.js), Python, Java, Go, and language-agnostic system design. The AI understands your ecosystem from your resume and focuses questions there.",
  },
  {
    q: "How accurate is the AI scoring?",
    a: "Scores are calibrated to real interview feedback: 50 = average (basic understanding), 75 = good (handles most questions), 85 = strong (depth + reasoning), 90+ = exceptional. We deliberately avoid inflating scores — an honest 72 is more useful than a feel-good 92.",
  },
  {
    q: "Do I need a microphone?",
    a: "For the voice-first experience, yes. But you can also type all your answers — the interview works fully in text mode without any mic. Toggle the mode at any time.",
  },
  {
    q: "How long does one session take?",
    a: "A standard session is 12–15 minutes. There are 8–12 questions depending on the format you choose (HR+Technical, Technical Only, or Full Format). Activities add ~2 minutes each.",
  },
  {
    q: "What happens to my resume data?",
    a: "Your resume is parsed into structured data and stored securely. It is never shared with third parties. Each interview is \"frozen\" against a specific resume snapshot — so upgrading your resume doesn't affect previous session reports.",
  },
  {
    q: "Can I take the same interview multiple times?",
    a: "Yes. Each session generates a fresh interview plan with different questions, even for the same job profile. You can track your score progression over time and see where you've improved.",
  },
]

// ─── STATS ────────────────────────────────────────────────────────────────────
const STATS = [
  { value: "15 min", label: "Average session length" },
  { value: "94%", label: "Report with actionable weak areas" },
  { value: "12", label: "Question types supported" },
  { value: "5+", label: "Tech ecosystems" },
]

// ─── Companies (aspirational logos as text) ───────────────────────────────────
const COMPANIES = ["Razorpay", "Swiggy", "Zepto", "Groww", "Meesho", "BrowserStack", "Postman"]

// ─────────────────────────────────────────────────────────────────────────────

export function HomePage({ session }: HomePageProps) {
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly")
  const plans = PLANS[billing]

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <HomeNav session={session} />

      <main className="flex-1 pt-16">

        {/* ──────────────────────────────────────────────────────────────────────
            HERO
        ────────────────────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden min-h-[92vh] flex items-center justify-center py-24">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-violet-900/10" />

          {/* Mesh grid bg */}
          <div className="absolute inset-0 mesh-grid opacity-40 [mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,#000_60%,transparent_100%)]" />

          {/* Ambient glows */}
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.18, 0.30, 0.18] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/3 left-1/4 -z-10 h-[560px] w-[560px] rounded-full bg-primary/40 blur-[130px]"
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.08, 0.18, 0.08], x: [0, 30, 0] }}
            transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute bottom-1/4 right-1/4 -z-10 h-[400px] w-[400px] rounded-full bg-violet-400/20 blur-[100px]"
          />

          <div className="relative z-10 mx-auto max-w-5xl px-4 text-center flex flex-col items-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/8 px-4 py-1.5 text-sm font-medium text-primary backdrop-blur-sm"
            >
              <Star className="h-3.5 w-3.5 fill-primary" />
              AI Interview Prep, built for Indian developers
            </motion.div>

            {/* H1 */}
            <motion.h1
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, ease: "easeOut" }}
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold leading-[1.08] tracking-tight"
            >
              Practice with an AI that{" "}
              <span className="text-gradient">actually listens</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-7 max-w-2xl text-lg md:text-xl text-muted-foreground leading-relaxed"
            >
              Upload your resume. Take a 15-minute voice interview tailored to your exact background.
              Get an honest report with weak areas, scores, and a learning roadmap.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
              className="mt-10 flex flex-col sm:flex-row items-center gap-3"
            >
              <Button
                asChild
                size="lg"
                className="h-13 px-8 rounded-full text-base font-semibold shadow-primary-glow hover:opacity-90 transition-opacity group"
              >
                <Link href={session ? "/candidate/dashboard" : "/register"} className="flex items-center gap-2">
                  {session ? "Go to Dashboard" : "Start free interview"}
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-13 px-8 rounded-full text-base font-medium">
                <Link href="#how-it-works">See how it works</Link>
              </Button>
            </motion.div>

            {/* Trust note */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-5 text-xs text-muted-foreground/60"
            >
              No credit card required · 1 free session · Cancel anytime
            </motion.p>
          </div>
        </section>

        {/* ──────────────────────────────────────────────────────────────────────
            LIVE DEMO MOCKUP
        ────────────────────────────────────────────────────────────────────── */}
        <section className="py-16 md:py-20 overflow-hidden">
          <div className="mx-auto max-w-4xl px-4">
            {/* Browser chrome */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6 }}
              className="rounded-2xl border border-border/60 overflow-hidden shadow-2xl shadow-primary/8"
            >
              {/* Title bar */}
              <div className="flex items-center gap-3 px-4 py-3 bg-surface-1 border-b border-border/50">
                <div className="flex gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-400/80" />
                  <span className="w-3 h-3 rounded-full bg-amber-400/80" />
                  <span className="w-3 h-3 rounded-full bg-green-400/80" />
                </div>
                <div className="flex-1 flex justify-center">
                  <span className="text-xs font-mono text-muted-foreground bg-background/60 border border-border/40 px-3 py-1 rounded-md">
                    foxtel.app/interview/active
                  </span>
                </div>
                <Badge variant="outline" className="text-[10px] text-green-500 border-green-500/30 bg-green-500/8">
                  ● Live
                </Badge>
              </div>

              {/* Chat area */}
              <div className="bg-background p-6 md:p-8 space-y-5 min-h-[280px]">
                {/* AI message */}
                <motion.div
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="flex gap-3 max-w-[88%]"
                >
                  <div className="h-8 w-8 rounded-full bg-primary/15 border border-primary/25 flex items-center justify-center shrink-0 mt-0.5">
                    <Brain className="h-4 w-4 text-primary" />
                  </div>
                  <div className="bg-surface-1 border border-border/50 rounded-2xl rounded-tl-sm px-4 py-3 text-sm leading-relaxed">
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-primary/60 block mb-1">Interviewer</span>
                    I see you built a real-time chat feature using Socket.io in your{" "}
                    <strong>CollabSpace</strong> project. How did you handle message ordering when the connection briefly dropped?
                  </div>
                </motion.div>

                {/* User message */}
                <motion.div
                  initial={{ opacity: 0, x: 12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="flex gap-3 max-w-[88%] ml-auto flex-row-reverse"
                >
                  <div className="h-8 w-8 rounded-full bg-surface-2 border border-border flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">
                    YOU
                  </div>
                  <div className="bg-primary/12 border border-primary/20 rounded-2xl rounded-tr-sm px-4 py-3 text-sm leading-relaxed">
                    We used a sequence number on each message. The server assigned it. On reconnect, the client sent its last known sequence, and the server replayed anything it missed.
                  </div>
                </motion.div>

                {/* AI follow-up with score badge */}
                <motion.div
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 }}
                  className="flex gap-3 max-w-[88%]"
                >
                  <div className="h-8 w-8 rounded-full bg-primary/15 border border-primary/25 flex items-center justify-center shrink-0 mt-0.5">
                    <Brain className="h-4 w-4 text-primary" />
                  </div>
                  <div className="relative bg-surface-1 border border-border/50 rounded-2xl rounded-tl-sm px-4 py-3 text-sm leading-relaxed">
                    <span className="absolute -top-3 right-3 inline-flex items-center gap-1 text-[10px] font-bold text-white bg-score-high text-score-high border border-score-high/30 bg-green-500 px-2 py-0.5 rounded-full">
                      <CheckCheck className="h-3 w-3" /> 82 / 100
                    </span>
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-primary/60 block mb-1">Interviewer</span>
                    Good approach. How would this change at scale — say 100k concurrent connections?
                  </div>
                </motion.div>

                {/* Input zone */}
                <div className="flex items-center gap-3 pt-2 border-t border-border/30 mt-4">
                  <div className="flex-1 flex items-center gap-2 bg-surface-1 border border-border/50 rounded-xl px-4 py-2.5">
                    <span className="h-2 w-2 rounded-full bg-red-400 animate-pulse" />
                    <span className="text-sm text-muted-foreground/60 italic">Listening — speak when ready</span>
                  </div>
                  <div className="flex items-center gap-0.5 h-6">
                    {[3, 6, 4, 7, 5, 8, 4, 6, 3].map((h, i) => (
                      <span key={i} className="w-0.5 bg-primary/50 rounded-full animate-pulse" style={{ height: `${h}px`, animationDelay: `${i * 80}ms` }} />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ──────────────────────────────────────────────────────────────────────
            STATS / TRUST BAR
        ────────────────────────────────────────────────────────────────────── */}
        <section className="py-12 border-y border-border/40 bg-surface-1/50">
          <div className="mx-auto max-w-5xl px-4">
            <p className="text-center text-xs uppercase tracking-widest font-semibold text-muted-foreground/60 mb-8">
              Trusted by developers from
            </p>
            <div className="flex flex-wrap justify-center items-center gap-x-10 gap-y-4 mb-10 opacity-50">
              {COMPANIES.map(c => (
                <span key={c} className="text-sm font-semibold text-foreground">{c}</span>
              ))}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-4">
              {STATS.map(({ value, label }) => (
                <div key={label} className="text-center">
                  <p className="text-2xl md:text-3xl font-extrabold text-foreground">{value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ──────────────────────────────────────────────────────────────────────
            HOW IT WORKS
        ────────────────────────────────────────────────────────────────────── */}
        <section id="how-it-works" className="py-20 md:py-28">
          <div className="mx-auto max-w-3xl px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">How {APP_NAME} works</h2>
              <p className="mt-4 text-muted-foreground text-lg">From zero to an honest report in under 20 minutes.</p>
            </div>

            {/* Vertical timeline */}
            <div className="relative">
              {/* Connecting line */}
              <div className="absolute left-5 top-6 bottom-6 w-px bg-gradient-to-b from-primary/60 via-primary/30 to-transparent" />

              {[
                { n: "01", title: "Create a Job Profile", desc: "Tell us the role you're targeting — Frontend, Backend, Fullstack, or System Design. Set your experience level and ecosystem." },
                { n: "02", title: "Upload your Resume", desc: "Drop your PDF or DOCX. Our AI parses your exact projects, skills, and experience to build a personalised interview plan." },
                { n: "03", title: "Take the AI Interview", desc: "Speak naturally — or type. The AI asks questions from your resume, follows up on weak answers, and inserts coding activities." },
                { n: "04", title: "Get your Report", desc: "Detailed scores across Technical, Communication, Confidence, and Authenticity. Weak areas with evidence. A learning roadmap." },
              ].map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ delay: i * 0.1 }}
                  className="relative flex gap-6 mb-10 last:mb-0"
                >
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center z-10 shadow-primary-glow">
                    {step.n}
                  </div>
                  <div className="pt-1.5 pb-8 border-b border-border/30 last:border-0 flex-1">
                    <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{step.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ──────────────────────────────────────────────────────────────────────
            FEATURES
        ────────────────────────────────────────────────────────────────────── */}
        <section id="features" className="py-20 md:py-28 bg-surface-1/40 border-y border-border/40">
          <div className="mx-auto max-w-6xl px-4">
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4 text-primary border-primary/30 bg-primary/8">Features</Badge>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Built for real interviews</h2>
              <p className="mt-4 text-muted-foreground text-lg max-w-xl mx-auto">Everything that makes the difference between passing and failing a tech screen.</p>
            </div>

            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-60px" }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-5"
            >
              {FEATURES.map(({ icon: Icon, title, desc }) => (
                <motion.div
                  key={title}
                  variants={fadeUp}
                  className="bg-card border border-border/50 hover:border-primary/30 rounded-2xl p-6 group hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 cursor-default"
                >
                  <div className="h-11 w-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-5 group-hover:bg-primary group-hover:border-primary transition-colors duration-300">
                    <Icon className="h-5 w-5 text-primary group-hover:text-primary-foreground transition-colors duration-300" />
                  </div>
                  <h3 className="font-semibold text-base mb-2">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ──────────────────────────────────────────────────────────────────────
            PRICING
        ────────────────────────────────────────────────────────────────────── */}
        <section id="pricing" className="py-20 md:py-28">
          <div className="mx-auto max-w-5xl px-4">
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4 text-primary border-primary/30 bg-primary/8">Pricing</Badge>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Simple, transparent pricing</h2>
              <p className="mt-4 text-muted-foreground text-lg">Start free. Upgrade when you&apos;re ready.</p>

              {/* Toggle */}
              <div className="mt-8 inline-flex items-center gap-1 bg-surface-1 border border-border/50 rounded-full p-1">
                {(["monthly", "yearly"] as const).map(b => (
                  <button
                    key={b}
                    onClick={() => setBilling(b)}
                    className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${billing === b
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                      }`}
                  >
                    {b === "monthly" ? "Monthly" : "Yearly · Save 28%"}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-5">
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className={`relative rounded-2xl p-6 flex flex-col transition-all duration-300 ${plan.highlight
                      ? "border-2 border-primary bg-primary/5 shadow-xl shadow-primary/15"
                      : "border border-border/50 bg-card"
                    }`}
                >
                  {plan.badge && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 text-[11px] font-bold text-primary-foreground bg-primary px-3 py-1 rounded-full">
                      <Star className="h-2.5 w-2.5 fill-current" /> {plan.badge}
                    </span>
                  )}
                  <div>
                    <h3 className={`text-base font-semibold ${plan.highlight ? "text-primary" : ""}`}>{plan.name}</h3>
                    <div className="mt-3 flex items-baseline gap-1">
                      <span className="text-4xl font-extrabold tracking-tight">{plan.price}</span>
                      <span className="text-sm text-muted-foreground">{plan.period}</span>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{plan.description}</p>
                  </div>
                  <ul className="mt-6 space-y-2.5 flex-1">
                    {plan.features.map(f => (
                      <li key={f} className="flex items-start gap-2.5 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button
                    asChild
                    className={`mt-8 rounded-full w-full font-semibold ${plan.highlight ? "shadow-primary-glow" : ""}`}
                    variant={plan.highlight ? "default" : "outline"}
                  >
                    <Link href={plan.href}>{plan.cta}</Link>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ──────────────────────────────────────────────────────────────────────
            FAQ
        ────────────────────────────────────────────────────────────────────── */}
        <section id="faq" className="py-20 md:py-28 bg-surface-1/40 border-y border-border/40">
          <div className="mx-auto max-w-2xl px-4">
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4 text-primary border-primary/30 bg-primary/8">FAQ</Badge>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Common questions</h2>
            </div>
            <Accordion type="single" collapsible className="space-y-2">
              {FAQ.map((item, i) => (
                <AccordionItem
                  key={i}
                  value={`faq-${i}`}
                  className="border border-border/50 rounded-xl px-5 bg-card data-[state=open]:border-primary/30"
                >
                  <AccordionTrigger className="text-sm font-medium text-left hover:no-underline py-4">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-4">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* ──────────────────────────────────────────────────────────────────────
            FINAL CTA
        ────────────────────────────────────────────────────────────────────── */}
        <section className="py-24 md:py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-violet-900/10" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] bg-primary/15 rounded-full blur-[120px] -z-10" />

          <div className="relative z-10 mx-auto max-w-3xl px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6 leading-tight">
                Stop guessing.<br />
                Start knowing where you stand.
              </h2>
              <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto leading-relaxed">
                One free session. No credit card. An honest report that shows exactly what a real interviewer would think of your answers.
              </p>
              <Button asChild size="lg" className="h-14 px-10 rounded-full text-base font-semibold shadow-primary-glow hover:opacity-90 transition-opacity">
                <Link href={session ? "/candidate/dashboard" : "/register"} className="flex items-center gap-2">
                  {session ? "Go to Dashboard" : "Start your free interview"}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <p className="mt-4 text-xs text-muted-foreground/50">No credit card · 1 free session · Setup in 2 minutes</p>
            </motion.div>
          </div>
        </section>
      </main>

      {/* ──────────────────────────────────────────────────────────────────────
          FOOTER
      ────────────────────────────────────────────────────────────────────── */}
      <footer className="border-t border-border/40 py-12 bg-surface-1/30">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
            <div className="md:col-span-2">
              <Logo size="md" showName href="/" />
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-xs">
                AI-powered mock interviews that adapt to your resume and give honest, actionable feedback.
              </p>
              <p className="mt-4 text-xs text-muted-foreground/50">Built in India 🇮🇳 with ❤️</p>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60 mb-4">Product</h4>
              <ul className="space-y-2.5">
                {[["#how-it-works", "How it Works"], ["#features", "Features"], ["#pricing", "Pricing"], ["#faq", "FAQ"]].map(([href, label]) => (
                  <li key={href}><Link href={href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">{label}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60 mb-4">Legal</h4>
              <ul className="space-y-2.5">
                {[["#", "Privacy Policy"], ["#", "Terms of Service"], ["#", "Refund Policy"]].map(([href, label]) => (
                  <li key={label}><Link href={href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">{label}</Link></li>
                ))}
              </ul>
            </div>
          </div>
          <div className="border-t border-border/40 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground/50">© {new Date().getFullYear()} {APP_NAME}. All rights reserved.</p>
            <div className="flex items-center gap-2">
              <Timer className="h-3.5 w-3.5 text-muted-foreground/40" />
              <span className="text-xs text-muted-foreground/40">15 min to your first score</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

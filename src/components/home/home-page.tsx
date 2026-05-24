"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { HomeNav } from "@/components/layout/home-nav"
import type { Session } from "@/lib/auth"
import { Sparkles, Brain, Target, LineChart, Mic, BookOpen, CheckCircle2, ArrowRight } from "lucide-react"

interface HomePageProps {
  session: Session | null
}

export function HomePage({ session }: HomePageProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary/30">

      <HomeNav session={session} />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-24 pb-20 md:pt-32 md:pb-32 flex items-center justify-center min-h-[90vh]">
          {/* Refined Grid Background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>

          {/* Animated Background Glows */}
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.15, 0.25, 0.15],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-1/4 left-1/4 -z-10 h-[500px] w-[500px] rounded-full bg-primary/30 blur-[120px]"
          />
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.1, 0.2, 0.1],
              x: [0, 40, 0]
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
            className="absolute bottom-1/4 right-1/4 -z-10 h-[400px] w-[400px] rounded-full bg-blue-500/20 blur-[100px]"
          />

          <div className="container relative mx-auto px-4 text-center z-10 flex flex-col items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.5, type: "spring", bounce: 0.3 }}
              className="inline-flex items-center space-x-2 overflow-hidden rounded-full border border-primary/20 bg-primary/5 px-6 py-2 shadow-sm backdrop-blur-md transition-all hover:border-primary/40 hover:bg-primary/10 mb-8 cursor-default"
            >
              <Sparkles className="w-4 h-4 text-primary" />
              <p className="text-sm font-medium text-foreground/90">
                Introducing AI Interviews 2.0
              </p>
            </motion.div>

            <div className="overflow-hidden max-w-5xl">
              <motion.h1
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, type: "spring", bounce: 0.2 }}
                className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-[1.1] text-foreground pb-2"
              >
                Master your next tech interview with <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">AI</span>.
              </motion.h1>
            </div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-8 max-w-2xl text-lg md:text-xl text-muted-foreground leading-relaxed"
            >
              Upload your resume and experience a personalized AI interview that adapts to your skills. Get honest, actionable feedback to land your dream job.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto"
            >
              <Button asChild size="lg" className="h-14 px-8 rounded-full text-base w-full sm:w-auto font-medium shadow-[0_0_40px_-10px_var(--primary)] hover:shadow-[0_0_60px_-15px_var(--primary)] transition-all duration-500 group">
                <Link href="/register" className="flex items-center gap-2">
                  Start free interview
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-14 px-8 rounded-full text-base w-full sm:w-auto font-medium border-border/60 hover:bg-muted/50 backdrop-blur-sm transition-colors">
                <Link href="#how-it-works">See how it works</Link>
              </Button>
            </motion.div>
          </div>
        </section>

        {/* Social Proof Section */}
        <section className="py-10 border-y border-border/40 bg-muted/20">
          <div className="container mx-auto px-4 text-center">
            <p className="text-xs font-semibold text-muted-foreground tracking-widest uppercase mb-6">Trusted by candidates at top companies</p>
            <div className="flex flex-wrap justify-center items-center gap-x-14 gap-y-8 opacity-50 grayscale transition-opacity hover:opacity-70">
              <span className="text-xl font-bold font-serif">Acme Corp</span>
              <span className="text-xl font-bold tracking-tighter">GLOBEX</span>
              <span className="text-xl font-bold italic">Soylent</span>
              <span className="text-xl font-bold">Initech</span>
              <span className="text-xl font-bold uppercase tracking-widest">Umbrella</span>
            </div>
          </div>
        </section>

        {/* Interactive Mockup / Visualization */}
        <section className="py-24 md:py-32 overflow-hidden relative">
          <div className="absolute top-0 right-0 -z-10 w-full h-full bg-gradient-to-b from-transparent to-primary/5"></div>
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Experience the real thing</h2>
              <p className="mt-4 text-muted-foreground max-w-2xl mx-auto text-lg">Our engine simulates the pressure and depth of a senior engineer interview.</p>
            </div>
            <div className="relative mx-auto max-w-5xl rounded-2xl border border-border/60 bg-background/60 backdrop-blur-xl shadow-2xl shadow-primary/5 overflow-hidden">
              {/* Browser Header */}
              <div className="flex items-center px-4 py-3 border-b border-border/60 bg-muted/40">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                </div>
                <div className="mx-auto text-xs font-medium text-muted-foreground font-mono bg-background/50 px-3 py-1 rounded-md border border-border/50 shadow-sm">
                  foxtel-interview-session
                </div>
              </div>
              
              {/* Chat Interface */}
              <div className="p-6 md:p-10 bg-gradient-to-b from-background/50 to-background flex flex-col gap-8">
                {/* AI Message */}
                <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex gap-4 items-start max-w-[85%]">
                  <div className="h-10 w-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 shadow-sm">
                    <Brain className="w-5 h-5 text-primary" />
                  </div>
                  <div className="bg-muted/50 border border-border/50 backdrop-blur-sm rounded-2xl rounded-tl-sm p-5 text-sm md:text-base leading-relaxed text-foreground shadow-sm">
                    I see from your resume you built a real-time dashboard using React and WebSockets. Can you explain how you handled state synchronization when the WebSocket connection dropped?
                  </div>
                </motion.div>

                {/* User Message */}
                <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="flex gap-4 items-start max-w-[85%] self-end flex-row-reverse">
                  <div className="h-10 w-10 rounded-full bg-secondary border border-border flex items-center justify-center shrink-0 shadow-sm">
                    <span className="text-xs font-bold text-foreground">YOU</span>
                  </div>
                  <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-sm p-5 text-sm md:text-base leading-relaxed shadow-md shadow-primary/20">
                    We implemented a local queue using Zustand. When the connection dropped, actions were pushed to the queue and saved to localStorage. Once reconnected, we replayed the queue with an exponential backoff strategy.
                  </div>
                </motion.div>

                {/* AI Follow-up */}
                <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.4 }} className="flex gap-4 items-start max-w-[85%]">
                  <div className="h-10 w-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 shadow-sm">
                    <Brain className="w-5 h-5 text-primary" />
                  </div>
                  <div className="bg-muted/50 border border-green-500/30 ring-1 ring-green-500/10 backdrop-blur-sm rounded-2xl rounded-tl-sm p-5 text-sm md:text-base leading-relaxed text-foreground shadow-sm relative">
                    <div className="absolute -top-3.5 -right-3.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-md border border-green-400/20">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Great Answer
                    </div>
                    That&apos;s a robust approach. How did you handle conflicts if the server state changed while the client was disconnected?
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section id="how-it-works" className="py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-20">
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">How Foxtel works</h2>
              <p className="mt-4 text-muted-foreground max-w-2xl mx-auto text-lg">From upload to detailed analytics in under 15 minutes.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto relative">
              <div className="hidden md:block absolute top-12 left-[20%] right-[20%] h-px bg-gradient-to-r from-transparent via-border to-transparent z-0"></div>

              {[
                { step: "01", title: "Upload your Resume", desc: "Drop your PDF. We instantly parse your skills, ecosystem, and project history to tailor the interview." },
                { step: "02", title: "Take the Interview", desc: "Engage in a dynamic, 15-minute technical conversation. The AI adapts to your skill level in real-time." },
                { step: "03", title: "Get Actionable Insights", desc: "Receive a brutally honest score and a breakdown of your top weaknesses with steps to improve." }
              ].map((item, i) => (
                <div key={i} className="relative z-10 flex flex-col items-center text-center group">
                  <div className="h-24 w-24 rounded-full bg-background border border-primary/20 flex items-center justify-center text-3xl font-bold text-primary mb-6 shadow-xl shadow-primary/5 group-hover:scale-105 transition-transform duration-300">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 md:py-32 border-t border-border/40 relative">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--primary)_0%,transparent_30%)] opacity-5"></div>
          <div className="container mx-auto px-4">
            <div className="text-center mb-20">
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Everything you need to succeed</h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
              {[
                { icon: BookOpen, title: "Resume Aware", desc: "Upload your PDF or DOCX. We instantly extract your projects, skills, and experience to ask highly relevant questions." },
                { icon: Target, title: "Adaptive Difficulty", desc: "Ace a question? We dig deeper. Struggle? We pivot to fundamentals. Just like a real senior engineer." },
                { icon: CheckCircle2, title: "Honest Scoring", desc: "No sugarcoating. You get real, objective scores on communication and technical depth." },
                { icon: LineChart, title: "Skill Analytics", desc: "Track your progress over time across different topics like React, Node, System Design, and more." },
                { icon: Mic, title: "Voice & Text", desc: "Speak naturally or type your answers. Our engine supports both modalities flawlessly." },
                { icon: Brain, title: "Targeted Prep", desc: "Based on your weak points, we suggest specific concepts and resources you need to study." }
              ].map((feature, i) => {
                const Icon = feature.icon;
                return (
                  <div key={i} className="bg-card border border-border/60 hover:border-primary/30 rounded-2xl p-8 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 group">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <Icon className="w-6 h-6 text-primary group-hover:text-primary-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-24 md:py-32 bg-muted/20 border-t border-border/40">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Simple, transparent pricing</h2>
              <p className="mt-4 text-muted-foreground text-lg">Start for free. Upgrade when you need more practice.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Free Plan */}
              <div className="border border-border/60 rounded-3xl p-8 bg-card flex flex-col relative overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-2xl font-bold">Free Trial</h3>
                <div className="mt-4 flex items-baseline text-5xl font-extrabold tracking-tight">
                  ₹0
                  <span className="ml-2 text-lg font-medium text-muted-foreground">/first session</span>
                </div>
                <p className="mt-4 text-muted-foreground">Perfect to test our AI interviewer engine.</p>
                <ul className="mt-8 space-y-4 flex-1">
                  {['1 full personalized interview', 'Top 3 Weaknesses Report', 'Ecosystem Detection'].map((item, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                      <span className="text-base">{item}</span>
                    </li>
                  ))}
                </ul>
                <Button variant="outline" className="mt-10 w-full rounded-full h-12 font-medium border-border/60 hover:bg-muted" asChild>
                  <Link href="/register">Get Started</Link>
                </Button>
              </div>

              {/* Pro Plan */}
              <div className="border-2 border-primary bg-background rounded-3xl p-8 flex flex-col relative overflow-hidden shadow-xl shadow-primary/10">
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-4 py-1.5 text-xs font-bold rounded-bl-xl uppercase tracking-wider shadow-sm">
                  Most Popular
                </div>
                <h3 className="text-2xl font-bold text-primary">Pro Monthly</h3>
                <div className="mt-4 flex items-baseline text-5xl font-extrabold tracking-tight">
                  ₹699
                  <span className="ml-2 text-lg font-medium text-muted-foreground">/mo</span>
                </div>
                <p className="mt-4 text-muted-foreground">Unlimited access for serious candidates.</p>
                <ul className="mt-8 space-y-4 flex-1">
                  {['Unlimited AI Interviews', 'Deep Skill Analytics', 'Historical Progress Tracking', 'Priority New Features'].map((item, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                      <span className="text-base font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
                <Button className="mt-10 w-full rounded-full h-12 font-medium shadow-lg shadow-primary/20" asChild>
                  <Link href="/register">Subscribe Now</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 md:py-32 border-t border-border/40 relative overflow-hidden">
          <div className="absolute inset-0 bg-primary/5"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[100px] -z-10"></div>
          <div className="container mx-auto px-4 text-center relative z-10">
            <h2 className="text-3xl font-bold tracking-tight md:text-5xl mb-6">Ready to land your dream job?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-10 text-lg">
              Join thousands of developers who have improved their interview skills and landed offers at top tech companies.
            </p>
            <Button asChild size="lg" className="h-14 px-10 rounded-full text-lg font-medium shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-shadow">
              <Link href="/register">Start your free interview</Link>
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-lg bg-foreground flex items-center justify-center shadow-sm">
                <span className="text-background font-bold text-sm leading-none">F</span>
              </div>
              <span className="font-semibold tracking-tight text-lg">Foxtel</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Foxtel. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Terms</Link>
              <Link href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Privacy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

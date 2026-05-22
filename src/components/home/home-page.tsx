"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { HomeNav } from "@/components/layout/home-nav"
import type { Session } from "@/lib/auth"

interface HomePageProps {
  session: Session | null
}

export function HomePage({ session }: HomePageProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary/30">

      <HomeNav session={session} />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-24 pb-20 md:pt-32 md:pb-32 flex items-center justify-center min-h-[85vh]">
          {/* Subtle Grid Background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px]"></div>

          {/* Animated Background Glows */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-1/4 left-1/4 -z-10 h-[400px] w-[400px] rounded-full bg-primary/20 blur-[120px]"
          />
          <motion.div
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.1, 0.15, 0.1],
              x: [0, 50, 0]
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
            className="absolute bottom-1/4 right-1/4 -z-10 h-[400px] w-[400px] rounded-full bg-blue-500/20 blur-[120px]"
          />

          <div className="container relative mx-auto px-4 text-center z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
              className="mx-auto flex max-w-fit items-center justify-center space-x-2 overflow-hidden rounded-full border border-border/50 bg-background/50 px-7 py-2 shadow-2xl backdrop-blur-md transition-all hover:border-primary/50 mb-8 cursor-default"
            >
              <p className="text-sm font-medium text-foreground flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                Introducing AI Interviews 2.0
              </p>
            </motion.div>

            <div className="overflow-hidden">
              <motion.h1
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, type: "spring", bounce: 0.2 }}
                className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tighter max-w-5xl mx-auto leading-[1.1] bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70 pb-2"
              >
                Master your next tech interview with <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">AI</span>.
              </motion.h1>
            </div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mx-auto mt-8 max-w-2xl text-lg text-muted-foreground sm:text-xl leading-relaxed"
            >
              Upload your resume and experience a personalized AI interview that adapts to your skills. Get honest, actionable feedback to land your dream job.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Button asChild size="lg" className="h-14 px-8 rounded-full text-base w-full sm:w-auto font-medium shadow-[0_0_40px_-10px_var(--primary)] hover:shadow-[0_0_60px_-15px_var(--primary)] transition-all duration-500 group">
                <Link href="/register" className="flex items-center gap-2">
                  Start free interview
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-14 px-8 rounded-full text-base w-full sm:w-auto font-medium border-border/50 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors">
                <Link href="#how-it-works">See how it works</Link>
              </Button>
            </motion.div>
          </div>
        </section>

        {/* Social Proof Section */}
        <section className="py-12 border-y border-border/40 bg-zinc-50 dark:bg-zinc-900/30">
          <div className="container mx-auto px-4 text-center">
            <p className="text-sm font-medium text-muted-foreground mb-6">TRUSTED BY CANDIDATES AT TOP COMPANIES</p>
            <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-8 opacity-60 grayscale">
              <span className="text-xl font-bold font-serif">Acme Corp</span>
              <span className="text-xl font-bold tracking-tighter">GLOBEX</span>
              <span className="text-xl font-bold italic">Soylent</span>
              <span className="text-xl font-bold">Initech</span>
              <span className="text-xl font-bold uppercase tracking-widest">Umbrella</span>
            </div>
          </div>
        </section>

        {/* Interactive Mockup / Visualization */}
        <section className="py-24 overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="relative mx-auto max-w-5xl rounded-xl border border-border/50 bg-background shadow-2xl overflow-hidden">
              <div className="flex items-center px-4 py-3 border-b border-border/50 bg-zinc-50 dark:bg-zinc-900/50">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                </div>
                <div className="mx-auto text-xs font-medium text-muted-foreground font-mono bg-background px-3 py-1 rounded-md border border-border/50">
                  foxtel-interview-session
                </div>
              </div>
              <div className="p-6 md:p-10 bg-background flex flex-col gap-6">
                <div className="flex gap-4 items-start max-w-2xl">
                  <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                    <span className="text-xs text-primary-foreground font-bold">AI</span>
                  </div>
                  <div className="bg-zinc-100 dark:bg-zinc-900 rounded-2xl rounded-tl-sm p-4 text-sm leading-relaxed text-foreground">
                    I see from your resume you built a real-time dashboard using React and WebSockets. Can you explain how you handled state synchronization when the WebSocket connection dropped?
                  </div>
                </div>

                <div className="flex gap-4 items-start max-w-2xl self-end flex-row-reverse">
                  <div className="h-8 w-8 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-foreground">YOU</span>
                  </div>
                  <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-sm p-4 text-sm leading-relaxed">
                    We implemented a local queue using Zustand. When the connection dropped, actions were pushed to the queue and saved to localStorage. Once reconnected, we replayed the queue with an exponential backoff strategy.
                  </div>
                </div>

                <div className="flex gap-4 items-start max-w-2xl">
                  <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                    <span className="text-xs text-primary-foreground font-bold">AI</span>
                  </div>
                  <div className="bg-zinc-100 dark:bg-zinc-900 rounded-2xl rounded-tl-sm p-4 text-sm leading-relaxed text-foreground border border-green-500/20 relative">
                    <div className="absolute -top-3 -right-3 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      Great Answer
                    </div>
                    That&apos;s a robust approach. How did you handle conflicts if the server state changed while the client was disconnected?
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section id="how-it-works" className="py-24 bg-zinc-50 dark:bg-zinc-900/20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">How Foxtel works</h2>
              <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">From upload to detailed analytics in under 15 minutes.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto relative">
              <div className="hidden md:block absolute top-12 left-[20%] right-[20%] h-0.5 bg-border/60 z-0"></div>

              {[
                { step: "01", title: "Upload your Resume", desc: "Drop your PDF. We instantly parse your skills, ecosystem, and project history to tailor the interview." },
                { step: "02", title: "Take the Interview", desc: "Engage in a dynamic, 15-minute technical conversation. The AI adapts to your skill level in real-time." },
                { step: "03", title: "Get Actionable Insights", desc: "Receive a brutally honest score and a breakdown of your top weaknesses with steps to improve." }
              ].map((item, i) => (
                <div key={i} className="relative z-10 flex flex-col items-center text-center">
                  <div className="h-24 w-24 rounded-full bg-background border-2 border-primary/20 flex items-center justify-center text-3xl font-bold text-primary mb-6 shadow-sm">
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
        <section id="features" className="py-24 border-t border-border/40">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Everything you need to succeed</h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {[
                { title: "Resume Aware", desc: "Upload your PDF or DOCX. We instantly extract your projects, skills, and experience to ask highly relevant questions." },
                { title: "Adaptive Difficulty", desc: "Ace a question? We dig deeper. Struggle? We pivot to fundamentals. Just like a real senior engineer." },
                { title: "Honest Scoring", desc: "No sugarcoating. You get real, objective scores on communication and technical depth." },
                { title: "Skill Analytics", desc: "Track your progress over time across different topics like React, Node, System Design, and more." },
                { title: "Voice & Text", desc: "Speak naturally or type your answers. Our engine supports both modalities flawlessly." },
                { title: "Targeted Prep", desc: "Based on your weak points, we suggest specific concepts and resources you need to study." }
              ].map((feature, i) => (
                <div key={i} className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <div className="h-5 w-5 bg-primary rounded-sm" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-24 bg-zinc-950 text-white overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Candidate stories</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {[
                { text: "Foxtel's AI grilled me exactly like the senior engineers at my final round. I wouldn't have passed without the feedback report highlighting my weak async JS knowledge.", author: "Sarah J.", role: "Frontend Developer" },
                { text: "The resume-awareness is insane. It asked me specific architectural questions about a microservice I built two years ago. Highly recommended for prep.", author: "David M.", role: "Backend Engineer" },
                { text: "I used to get extremely nervous during technical rounds. Doing 5 practice sessions on Foxtel completely cured my anxiety.", author: "Priya K.", role: "Fullstack Engineer" }
              ].map((testimonial, i) => (
                <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 flex flex-col justify-between">
                  <p className="text-zinc-300 leading-relaxed mb-8">&ldquo;{testimonial.text}&rdquo;</p>
                  <div>
                    <p className="font-semibold">{testimonial.author}</p>
                    <p className="text-sm text-zinc-500">{testimonial.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Simple, transparent pricing</h2>
              <p className="mt-4 text-muted-foreground">Start for free. Upgrade when you need more practice.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Free Plan */}
              <div className="border border-border/50 rounded-3xl p-8 bg-card flex flex-col relative overflow-hidden">
                <h3 className="text-2xl font-bold">Free Trial</h3>
                <div className="mt-4 flex items-baseline text-5xl font-extrabold tracking-tight">
                  ₹0
                  <span className="ml-1 text-xl font-medium text-muted-foreground">/first session</span>
                </div>
                <p className="mt-4 text-muted-foreground">Perfect to test our AI interviewer engine.</p>
                <ul className="mt-8 space-y-4 flex-1">
                  {['1 full personalized interview', 'ATS Resume Score', 'Top 3 Weaknesses Report', 'Ecosystem Detection'].map((item, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <svg className="h-5 w-5 text-primary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
                <Button variant="outline" className="mt-8 w-full rounded-full h-12 font-medium" asChild>
                  <Link href="/register">Get Started</Link>
                </Button>
              </div>

              {/* Pro Plan */}
              <div className="border border-primary bg-primary/5 rounded-3xl p-8 flex flex-col relative overflow-hidden shadow-sm">
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-4 py-1 text-xs font-bold rounded-bl-xl uppercase tracking-wider">
                  Most Popular
                </div>
                <h3 className="text-2xl font-bold text-primary">Pro Monthly</h3>
                <div className="mt-4 flex items-baseline text-5xl font-extrabold tracking-tight">
                  ₹699
                  <span className="ml-1 text-xl font-medium text-muted-foreground">/mo</span>
                </div>
                <p className="mt-4 text-muted-foreground">Unlimited access for serious candidates.</p>
                <ul className="mt-8 space-y-4 flex-1">
                  {['Unlimited AI Interviews', 'Deep Skill Analytics', 'Historical Progress Tracking', 'Priority New Features'].map((item, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <svg className="h-5 w-5 text-primary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
                <Button className="mt-8 w-full rounded-full h-12 font-medium" asChild>
                  <Link href="/register">Subscribe Now</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 border-t border-border/40 relative overflow-hidden">
          <div className="absolute inset-0 bg-primary/5"></div>
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
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-foreground flex items-center justify-center">
                <span className="text-background font-bold text-xs leading-none">F</span>
              </div>
              <span className="font-semibold tracking-tight">Foxtel</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Foxtel. All rights reserved.
            </p>
            <div className="flex gap-4">
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">Terms</Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">Privacy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

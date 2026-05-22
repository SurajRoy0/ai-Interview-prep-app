import Link from "next/link"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-2 bg-background">
      <div className="hidden flex-col justify-between border-r border-border/40 bg-zinc-950 p-10 text-white md:flex relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px]"></div>

        <div className="relative z-10 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-black">
            <span className="text-sm font-bold leading-none">F</span>
          </div>
          <span className="text-xl font-semibold tracking-tight">Foxtel</span>
        </div>

        <div className="relative z-10 mt-auto">
          <blockquote className="space-y-4">
            <p className="text-2xl font-medium leading-relaxed tracking-tight text-zinc-200">
              &ldquo;The personalized AI interviews helped me identify my weak spots in React. The
              structured feedback was exactly what I needed to land my dream job.&rdquo;
            </p>
            <footer className="text-sm text-zinc-400">
              <span className="font-semibold text-white">Alex Chen</span>
              {" "}— Senior Frontend Engineer
            </footer>
          </blockquote>
        </div>
      </div>

      <div className="flex flex-col p-6 md:p-10 justify-center">
        <div className="flex justify-center md:hidden mb-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <span className="text-sm font-bold leading-none">F</span>
            </div>
            <span className="text-xl font-semibold tracking-tight">Foxtel</span>
          </Link>
        </div>
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
          {children}
        </div>
      </div>
    </div>
  )
}

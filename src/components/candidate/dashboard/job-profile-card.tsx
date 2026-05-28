import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Briefcase, CheckCircle2, ChevronRight, CircleDashed, Target } from "lucide-react"

const ECOSYSTEM_COLOR: Record<string, string> = {
  JAVASCRIPT: "text-yellow-500 bg-yellow-500/10 border-yellow-500/25",
  PYTHON: "text-blue-400 bg-blue-400/10 border-blue-400/25",
  JAVA: "text-orange-500 bg-orange-500/10 border-orange-500/25",
  GO: "text-cyan-400 bg-cyan-400/10 border-cyan-400/25",
  OTHER: "text-muted-foreground bg-muted border-border",
}

const LEVEL_LABEL: Record<string, string> = {
  FRESHER: "Fresher",
  JUNIOR: "Junior",
  MID: "Mid-Level",
  SENIOR: "Senior",
}

type JobProfileCardProps = {
  profile: {
    id: string
    title: string
    targetRole: string
    ecosystem: string | null
    experienceLevel: string
    activeResume: unknown
    _count: {
      interviews: number
      resumes: number
    }
  }
}

export function JobProfileCard({ profile }: JobProfileCardProps) {
  const ecosystemClass = ECOSYSTEM_COLOR[profile.ecosystem ?? "OTHER"] ?? ECOSYSTEM_COLOR.OTHER
  const level = LEVEL_LABEL[profile.experienceLevel] ?? profile.experienceLevel

  return (
    <Link
      href={`/candidate/job-profiles/${profile.id}`}
      className="group bg-card border border-border/50 hover:border-primary/35 rounded-2xl p-5 flex flex-col gap-4 hover:shadow-md hover:shadow-primary/5 transition-all duration-200"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
          <Briefcase className="h-4.5 w-4.5 text-primary" />
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all mt-0.5" />
      </div>

      <div>
        <h3 className="font-semibold text-sm leading-tight group-hover:text-primary transition-colors">
          {profile.title}
        </h3>
        <div className="flex items-center gap-1.5 mt-1">
          <Target className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">{profile.targetRole}</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={`text-[10px] px-2 py-0.5 font-medium ${ecosystemClass}`}
          >
            {profile.ecosystem ?? "General"}
          </Badge>
          <Badge variant="outline" className="text-[10px] px-2 py-0.5 font-medium text-muted-foreground border-border/50">
            {level}
          </Badge>
        </div>

        <span className={`flex items-center gap-1 text-[10px] font-medium ${profile.activeResume ? "text-green-500" : "text-amber-500"
          }`}>
          {profile.activeResume
            ? <><CheckCircle2 className="h-3 w-3" /> Resume ready</>
            : <><CircleDashed className="h-3 w-3" /> No resume</>
          }
        </span>
      </div>

      <div className="pt-3 border-t border-border/40 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{profile._count.interviews} interview{profile._count.interviews !== 1 ? "s" : ""}</span>
        <span className="text-[10px] text-muted-foreground/50">{profile._count.resumes} resume{profile._count.resumes !== 1 ? "s" : ""}</span>
      </div>
    </Link>
  )
}

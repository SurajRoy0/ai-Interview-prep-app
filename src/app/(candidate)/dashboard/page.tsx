import Link from "next/link"
import { getDashboardProfile } from "@/actions/user"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Mic, ArrowRight } from "lucide-react"

export default async function DashboardPage() {
  const user = await getDashboardProfile()

  const name = user.name?.split(" ")[0] ?? "there"
  const interviewCount = user._count.interviews
  const resumeCount = user._count.resumes

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, {name}</h1>
        <p className="text-muted-foreground mt-1">
          Upload your resume and start a personalised AI interview.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Interviews taken</CardDescription>
            <CardTitle className="text-3xl">{interviewCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active resumes</CardDescription>
            <CardTitle className="text-3xl">{resumeCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Free interview</CardDescription>
            <CardTitle className="text-3xl">
              {user.freeInterviewUsed ? "Used" : "Available"}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Account</CardDescription>
            <CardTitle className="text-lg capitalize">{user.role.toLowerCase()}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Upload your resume
            </CardTitle>
            <CardDescription>
              Get an ATS score and personalised interview questions based on your experience.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/resume/upload">
                Upload resume
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mic className="h-5 w-5" />
              Start an interview
            </CardTitle>
            <CardDescription>
              Take a resume-aware mock interview and get honest feedback on your skills.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant={resumeCount > 0 ? "default" : "secondary"}>
              <Link href="/interview/setup">
                {resumeCount > 0 ? "Start interview" : "Upload resume first"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

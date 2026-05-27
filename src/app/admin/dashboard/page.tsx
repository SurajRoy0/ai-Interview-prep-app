import { getAdminDashboardStatsAction } from '@/actions/admin'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, FileText, CheckCircle, Video } from 'lucide-react'

export default async function AdminDashboardPage() {
  const statsData = await getAdminDashboardStatsAction()
  
  const stats = [
    {
      title: 'Total Users',
      value: statsData.totalUsers,
      icon: Users,
      description: 'Registered users on the platform',
    },
    {
      title: 'Total Interviews',
      value: statsData.totalInterviews,
      icon: Video,
      description: 'All mock interviews created',
    },
    {
      title: 'Completed Interviews',
      value: statsData.completedInterviews,
      icon: CheckCircle,
      description: 'Interviews fully completed',
    },
    {
      title: 'Resumes Uploaded',
      value: statsData.totalResumes,
      icon: FileText,
      description: 'Resumes processed by the parser',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">Platform overview and statistics.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon
          return (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

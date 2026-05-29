import { getAdminPlanConfigsAction } from '@/actions/admin'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

export default async function AdminConfigPage() {
  const configs = await getAdminPlanConfigsAction()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Interview Configs</h1>
          <p className="text-muted-foreground mt-1">Manage global rules and limits for mock interviews.</p>
        </div>
        <Button asChild>
          <Link href="/admin/configs/new">
            <Plus className="h-4 w-4 mr-2" /> New Config
          </Link>
        </Button>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Default</TableHead>
              <TableHead className="text-right">Topics</TableHead>
              <TableHead className="text-right">Max Follow-ups</TableHead>
              <TableHead className="text-right">Max Profiles</TableHead>
              <TableHead className="text-right">Max Resumes/Day</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {configs.map((config) => (
              <TableRow key={config.id}>
                <TableCell className="font-medium">{config.name}</TableCell>
                <TableCell>
                  {config.isActive ? (
                    <Badge variant="default" className="bg-green-500/15 text-green-600 hover:bg-green-500/25 border-none">Active</Badge>
                  ) : (
                    <Badge variant="secondary">Inactive</Badge>
                  )}
                </TableCell>
                <TableCell>
                  {config.isDefault ? (
                    <Badge variant="outline" className="border-primary text-primary">Default</Badge>
                  ) : (
                    '—'
                  )}
                </TableCell>
                <TableCell className="text-right">{config.targetTopics}</TableCell>
                <TableCell className="text-right">{config.maxFollowUpsPerTopic}</TableCell>
                <TableCell className="text-right">{config.maxJobProfiles}</TableCell>
                <TableCell className="text-right">{config.maxResumeUploadsPerDay}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/admin/configs/${config.id}`}>Edit</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {configs.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  No configurations found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

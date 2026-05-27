import { getAdminSubscriptionsAction } from '@/actions/admin'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'

export default async function AdminSubscriptionsPage() {
  const subscriptions = await getAdminSubscriptionsAction()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Subscriptions</h1>
        <p className="text-muted-foreground mt-1">View user subscription details as per the schema.</p>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Credits Left</TableHead>
              <TableHead className="text-right">Expires</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subscriptions.map((sub) => (
              <TableRow key={sub.id}>
                <TableCell>
                  <div className="font-medium">{sub.user?.name || '—'}</div>
                  <div className="text-xs text-muted-foreground">{sub.user?.email}</div>
                </TableCell>
                <TableCell className="font-medium capitalize">{sub.planName.replace('_', ' ')}</TableCell>
                <TableCell>
                  <Badge variant={sub.status === 'ACTIVE' ? 'default' : 'secondary'}>
                    {sub.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">{sub.interviewsLeft}</TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {format(sub.endsAt, 'MMM d, yyyy')}
                </TableCell>
              </TableRow>
            ))}
            {subscriptions.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  No subscriptions found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

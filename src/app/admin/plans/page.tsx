import { getAdminPlansAction } from '@/actions/admin/plan'
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

export default async function AdminPlansPage() {
  const plans = await getAdminPlansAction()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Commercial Plans</h1>
          <p className="text-muted-foreground mt-1">Manage pricing, credits, and commercial packages.</p>
        </div>
        <Button asChild>
          <Link href="/admin/plans/create">
            <Plus className="h-4 w-4 mr-2" /> New Plan
          </Link>
        </Button>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Internal Name</TableHead>
              <TableHead>Display Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Visible</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Credits</TableHead>
              <TableHead className="text-right">Linked Config</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {plans.map((plan) => (
              <TableRow key={plan.id}>
                <TableCell className="font-medium text-muted-foreground">{plan.name}</TableCell>
                <TableCell className="font-medium">{plan.displayName}</TableCell>
                <TableCell>
                  {plan.isActive ? (
                    <Badge variant="default" className="bg-green-500/15 text-green-600 hover:bg-green-500/25 border-none">Active</Badge>
                  ) : (
                    <Badge variant="secondary">Inactive</Badge>
                  )}
                </TableCell>
                <TableCell>
                  {plan.isVisible ? (
                    <Badge variant="outline" className="border-primary text-primary">Yes</Badge>
                  ) : (
                    'No'
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {plan.amountPaise ? `₹${plan.amountPaise / 100} / ${plan.billingInterval === 'ONE_TIME' ? 'once' : plan.billingInterval === 'MONTHLY' ? 'mo' : plan.billingInterval === 'QUARTERLY' ? 'qtr' : 'yr'}` : 'Free'}
                </TableCell>
                <TableCell className="text-right">{plan.includedCredits}</TableCell>
                <TableCell className="text-right">
                  {plan.planConfig?.name || <span className="text-destructive">Missing</span>}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/admin/plans/${plan.id}`}>Edit</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {plans.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                  No plans found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

import { getAdminPlanConfigsAction } from '@/actions/admin'
import { getAdminPlanByIdAction } from '@/actions/admin/plan'
import { PlanForm } from '@/components/admin/plans/plan-form'
import { notFound } from 'next/navigation'

interface EditPlanPageProps {
  params: Promise<{ id: string }>
}

export default async function EditPlanPage({ params }: EditPlanPageProps) {
  const { id } = await params
  const [plan, configs] = await Promise.all([
    getAdminPlanByIdAction(id),
    getAdminPlanConfigsAction()
  ])

  if (!plan) {
    notFound()
  }

  return (
    <div className="max-w-4xl mx-auto">
      <PlanForm 
        initialData={plan} 
        planId={plan.id}
        configs={configs}
      />
    </div>
  )
}

import { getAdminPlanConfigsAction } from '@/actions/admin'
import { PlanForm } from '@/components/admin/plans/plan-form'

export default async function CreatePlanPage() {
  const configs = await getAdminPlanConfigsAction()

  return (
    <div className="max-w-4xl mx-auto">
      <PlanForm configs={configs} />
    </div>
  )
}

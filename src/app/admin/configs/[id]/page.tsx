import { getAdminConfigByIdAction } from "@/actions/admin-config"
import { ConfigForm } from "@/components/admin/configs/config-form"
import { notFound } from "next/navigation"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditConfigPage({ params }: PageProps) {
  const { id } = await params
  const config = await getAdminConfigByIdAction(id)

  if (!config) {
    notFound()
  }

  return (
    <div className="mx-auto w-full max-w-4xl">
      <ConfigForm initialData={config} configId={id} />
    </div>
  )
}

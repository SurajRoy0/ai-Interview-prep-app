import { getSession } from "@/lib/auth-server"
import { HomePage } from "@/components/home/home-page"

export default async function Page() {
  const session = await getSession()
  return <HomePage session={session} />
}

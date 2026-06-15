import { ReactNode } from 'react'

export default async function InterviewLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  console.log(id, "Interview Id")

  return (
    <>
      {children}
    </>
  )
}

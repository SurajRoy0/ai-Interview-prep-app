export function InterviewHeader({ title }: { title?: string }) {
  return (
    <header className="border-b px-4 py-3">
      <h1 className="font-semibold">{title ?? 'Interview'}</h1>
    </header>
  )
}

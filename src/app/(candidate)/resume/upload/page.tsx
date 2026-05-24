export default function ResumeUploadPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Upload Resume</h1>
        <p className="text-muted-foreground">Upload your resume to start interviewing.</p>
      </div>
      
      <div className="rounded-xl border border-dashed border-border bg-card text-card-foreground p-12 text-center">
        <div className="mx-auto h-12 w-12 text-muted-foreground mb-4">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
        <p className="text-sm text-muted-foreground">Drag and drop your PDF or DOCX here, or click to browse.</p>
      </div>
    </div>
  )
}

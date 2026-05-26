'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

export function CompletedScreen({ interviewId }: { interviewId: string }) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/30 p-4">
      <Card className="max-w-lg w-full text-center">
        <CardHeader>
          <div className="mx-auto w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <CardTitle className="text-2xl">Interview Completed</CardTitle>
          <CardDescription>
            Great job! Your interview has concluded and your responses have been saved.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            We are now generating your detailed performance report. This usually takes a minute or two.
            You can check the report from your dashboard.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center space-x-4">
          <Button asChild variant="outline">
            <Link href="/dashboard">Return to Dashboard</Link>
          </Button>
          <Button asChild>
            <Link href={`/interview/${interviewId}`}>View Report</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

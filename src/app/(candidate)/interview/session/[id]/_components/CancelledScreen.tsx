'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { XCircle } from 'lucide-react'
import Link from 'next/link'

export function CancelledScreen({}: { interviewId: string }) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/30 p-4">
      <Card className="max-w-lg w-full text-center">
        <CardHeader>
          <div className="mx-auto w-12 h-12 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center mb-4">
            <XCircle className="w-6 h-6" />
          </div>
          <CardTitle className="text-2xl">Interview Cancelled</CardTitle>
          <CardDescription>
            This interview session has been cancelled.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            If you did not cancel this session, please contact support.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button asChild variant="outline">
            <Link href="/dashboard">Return to Dashboard</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

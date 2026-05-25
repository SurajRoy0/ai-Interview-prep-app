'use server' // <-- 1. This tells Next.js this code MUST run securely on the server

import { prisma } from '@repo/db'
import { getSession } from '@/lib/auth-server'
import { createInterviewSchema } from '@repo/validators'

export async function createInterviewAction(formData: unknown) {
    // 2. CHECK AUTH: Get the session directly from the server.
    // We don't trust the client to tell us who they are.
    const session = await getSession()
    if (!session?.user?.id) {
        throw new Error('Unauthorized')
    }

    // 3. VALIDATE DATA: We use your exact schema from the validators package!
    // If the data is bad, .parse() will throw an error immediately.
    const validatedData = createInterviewSchema.parse(formData)

    // 4. DATABASE: Fetch resume to get jobProfileId, then create interview
    const resume = await prisma.resume.findUnique({ where: { id: validatedData.resumeId } })
    if (!resume) throw new Error("Resume not found")

    const newInterview = await prisma.interview.create({
        data: {
            userId: session.user.id,
            jobProfileId: resume.jobProfileId,
            resumeId: validatedData.resumeId,
            type: validatedData.type,
            status: 'PENDING'
        }
    })

    // 5. REALTIME: Removed Ably. We will use AI Streaming instead.

    // 6. RETURN: Send the result back to the frontend component
    return { success: true, interviewId: newInterview.id }
}


// 'use client'

// import { createInterviewAction } from '@/actions/interview'
// import { useState } from 'react'

// export default function StartInterviewButton() {
//   const [loading, setLoading] = useState(false)

//   const handleStart = async () => {
//     setLoading(true)
//     try {
//       // Look how easy this is! Just call the function directly.
//       const result = await createInterviewAction({ 
//         resumeId: 'clxyz123', 
//         type: 'FREE' 
//       })
      
//       console.log('Started interview:', result.interviewId)
//     } catch (error) {
//       console.error("Validation failed or unauthorized!", error)
//     } finally {
//       setLoading(false)
//     }
//   }

//   return <button onClick={handleStart} disabled={loading}>Start Interview</button>
// }

'use server'

import { requireSession } from '@/lib/auth-server'
import { prisma } from '@repo/db'
import { storeFile } from '@/lib/storage'
import { validatePdf } from '@/lib/file-validation'
import { resumeParseQueue } from '@/lib/queues'
import { ok, fail } from '@/lib/action-result'

export async function uploadResumeAction(jobProfileId: string, formData: FormData) {
  const session = await requireSession()

  const profile = await prisma.jobProfile.findUnique({ where: { id: jobProfileId } })
  if (!profile || profile.userId !== session.user.id) return fail('NOT_FOUND')

  const file = formData.get('file') as File | null
  if (!file) return fail('NO_FILE')

  if (file.size > 5 * 1024 * 1024) return fail('FILE_TOO_LARGE')

  const buffer = Buffer.from(await file.arrayBuffer())
  const isValidPdf = await validatePdf(buffer)
  if (!isValidPdf) return fail('INVALID_FILE_TYPE')

  const fileUrl = await storeFile(buffer, file.name)
  const fileKey = fileUrl

  // Create new resume 
  const resume = await prisma.resume.create({
    data: {
      userId: session.user.id,
      fileKey,
      fileUrl,
      rawText: '',
      parsedData: {},
      parseStatus: 'PENDING',
      isActive: true,
    },
  })

  // Link resume to JobProfile
  await prisma.jobProfile.update({
    where: { id: jobProfileId },
    data: { resumeId: resume.id }
  })

  // Enqueue parsing job
  await resumeParseQueue.add(
    'parse',
    { resumeId: resume.id },
    {
      jobId: `resume-parse-${resume.id}`,
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
    }
  )

  return ok({ resumeId: resume.id })
}

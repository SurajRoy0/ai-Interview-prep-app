'use server'

import { prisma } from '@repo/db'
import { getSession } from '@/lib/auth-server'
import { ActionResult, success, failure } from '@/lib/action-result'
import { extractTextFromFileBuffer } from '@repo/ai'
import { resumeQueue } from '@/lib/queues'
import { revalidatePath } from 'next/cache'

export async function uploadResumeAction(formData: FormData): Promise<ActionResult<{ resumeId: string }>> {
  try {
    const session = await getSession()
    if (!session) return failure('Unauthorized', 'UNAUTHORIZED')

    const file = formData.get('file') as File | null
    const jobProfileId = formData.get('jobProfileId') as string | null

    if (!file || !jobProfileId) {
      return failure('File and Job Profile ID are required', 'BAD_REQUEST')
    }

    // Ensure Job Profile exists and belongs to user
    const profile = await prisma.jobProfile.findUnique({
      where: { id: jobProfileId, userId: session.user.id }
    })

    if (!profile) return failure('Job profile not found', 'NOT_FOUND')

    // Determine safe version using max existing version
    const maxVersionAgg = await prisma.resume.aggregate({
      where: { jobProfileId },
      _max: { version: true }
    })
    const newVersion = (maxVersionAgg._max.version || 0) + 1

    // Extract raw text
    const buffer = Buffer.from(await file.arrayBuffer())
    let rawText = ''
    try {
      rawText = await extractTextFromFileBuffer(buffer, file.type)
    } catch {
      return failure('Failed to extract text from file. Please ensure it is a valid PDF or DOCX.', 'EXTRACTION_ERROR')
    }

    if (rawText.length < 50) {
      return failure('Extracted text is too short. Please upload a valid resume.', 'INVALID_FILE')
    }

    // Create Resume record with PENDING parse status
    const resume = await prisma.resume.create({
      data: {
        jobProfileId,
        fileName: file.name,
        version: newVersion,
        parseStatus: 'PENDING',
        parseError: null,
        rawText,
        rawTextLength: rawText.length,
        parsedData: {}, // Empty JSON for now
      }
    })

    // Update the active resume pointer for the job profile
    await prisma.jobProfile.update({
      where: { id: jobProfileId },
      data: { activeResumeId: resume.id }
    })

    // Queue the background job for AI parsing
    await resumeQueue.add('parse-resume', { resumeId: resume.id })

    revalidatePath(`/job-profiles/${jobProfileId}`)

    return success({ resumeId: resume.id })
  } catch (error) {
    console.error('[uploadResumeAction]', error)
    return failure('Failed to upload resume', 'INTERNAL_ERROR')
  }
}

export async function deleteResumeAction(resumeId: string): Promise<ActionResult<{ success: boolean }>> {
  try {
    const session = await getSession()
    if (!session) return failure('Unauthorized', 'UNAUTHORIZED')

    const resume = await prisma.resume.findUnique({
      where: { id: resumeId, jobProfile: { userId: session.user.id } },
      include: { activeForJobProfile: true, jobProfile: true }
    })

    if (!resume) return failure('Resume not found', 'NOT_FOUND')

    // Prevent deletion if used in an interview
    const interviewCount = await prisma.interview.count({
      where: { resumeId }
    })

    if (interviewCount > 0) {
      return failure('Cannot delete a resume that has been used in past interviews. Instead, upload a new version.', 'CONFLICT')
    }

    const jobProfileId = resume.jobProfile.id

    // Hard delete
    await prisma.resume.delete({
      where: { id: resumeId }
    })

    // If it was the active resume, assign the latest remaining resume
    if (resume.activeForJobProfile) {
      const remainingLatest = await prisma.resume.findFirst({
        where: { jobProfileId },
        orderBy: { version: 'desc' }
      })

      await prisma.jobProfile.update({
        where: { id: jobProfileId },
        data: { activeResumeId: remainingLatest ? remainingLatest.id : null }
      })
    }

    revalidatePath(`/job-profiles/${jobProfileId}`)

    return success({ success: true })
  } catch (error) {
    console.error('[deleteResumeAction]', error)
    return failure('Failed to delete resume', 'INTERNAL_ERROR')
  }
}

export async function retryResumeParseAction(resumeId: string): Promise<ActionResult<{ success: boolean }>> {
  try {
    const session = await getSession()
    if (!session) return failure('Unauthorized', 'UNAUTHORIZED')

    const resume = await prisma.resume.findUnique({
      where: { id: resumeId, jobProfile: { userId: session.user.id } },
    })

    if (!resume) return failure('Resume not found', 'NOT_FOUND')

    await prisma.resume.update({
      where: { id: resumeId },
      data: { parseStatus: 'PENDING', parseError: null }
    })

    await resumeQueue.add('parse-resume', { resumeId: resume.id })

    revalidatePath(`/job-profiles/${resume.jobProfileId}`)

    return success({ success: true })
  } catch (error) {
    console.error('[retryResumeParseAction]', error)
    return failure('Failed to retry parsing', 'INTERNAL_ERROR')
  }
}

export async function activateResumeAction(resumeId: string): Promise<ActionResult<{ success: boolean }>> {
  try {
    const session = await getSession()
    if (!session) return failure('Unauthorized', 'UNAUTHORIZED')

    const resume = await prisma.resume.findUnique({
      where: { id: resumeId, jobProfile: { userId: session.user.id } },
      include: { jobProfile: true }
    })

    if (!resume) return failure('Resume not found', 'NOT_FOUND')

    await prisma.jobProfile.update({
      where: { id: resume.jobProfileId },
      data: { activeResumeId: resume.id }
    })

    revalidatePath(`/job-profiles/${resume.jobProfileId}`)

    return success({ success: true })
  } catch (error) {
    console.error('[activateResumeAction]', error)
    return failure('Failed to activate resume', 'INTERNAL_ERROR')
  }
}

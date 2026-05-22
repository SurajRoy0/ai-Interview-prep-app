import { Job } from 'bullmq'
import { prisma } from '@repo/db'
import { extractTextFromPdf, parseResumeData } from '@repo/ai'
import fs from 'fs/promises'
import path from 'path'

// Worker runs from /worker, so root uploads dir is '../uploads'
const UPLOADS_DIR = path.resolve(process.cwd(), '../uploads')

export default async function resumeProcessor(job: Job) {
  const { resumeId } = job.data

  console.log(`[Resume Worker] Processing resume: ${resumeId}`)

  // 1. Mark as processing
  const resume = await prisma.resume.update({
    where: { id: resumeId },
    data: { parseStatus: 'PROCESSING' }
  })

  try {
    if (!resume.fileKey) throw new Error('No fileKey found on resume')

    // 2. Load file
    const fileName = resume.fileKey.replace('/uploads/', '')
    const filePath = path.join(UPLOADS_DIR, fileName)
    const fileBuf = await fs.readFile(filePath)

    // 3. Extract & Parse
    console.log(`[Resume Worker] Extracting text...`)
    const rawText = await extractTextFromPdf(fileBuf)
    
    console.log(`[Resume Worker] Structuring JSON via Gemini...`)
    const parsedData = await parseResumeData(rawText)

    // 4. Save and mark DONE
    await prisma.resume.update({
      where: { id: resumeId },
      data: {
        rawText,
        rawTextLength: rawText.length,
        parsedData: parsedData as any, // Prisma Json
        parseStatus: 'DONE'
      }
    })

    console.log(`[Resume Worker] Successfully parsed resume: ${resumeId}`)
  } catch (error) {
    console.error(`[Resume Worker] Failed to parse resume ${resumeId}:`, error)
    await prisma.resume.update({
      where: { id: resumeId },
      data: { parseStatus: 'FAILED' }
    })
    throw error 
  }
}

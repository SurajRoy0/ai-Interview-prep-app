import fs from 'fs/promises'
import path from 'path'
import crypto from 'crypto'

const UPLOADS_DIR = path.join(process.cwd(), 'uploads')

export async function storeFile(fileBuf: Buffer, originalName: string): Promise<string> {
  // Ensure directory exists
  await fs.mkdir(UPLOADS_DIR, { recursive: true })

  // Create unique filename to avoid collisions
  const ext = path.extname(originalName)
  const hash = crypto.randomBytes(16).toString('hex')
  const fileName = `${hash}${ext}`
  const filePath = path.join(UPLOADS_DIR, fileName)

  await fs.writeFile(filePath, fileBuf)
  
  // Return a relative path identifier for the DB
  return `/uploads/${fileName}`
}

export async function getFile(fileKey: string): Promise<Buffer> {
  // fileKey is expected to be '/uploads/xyz.pdf'
  const fileName = fileKey.replace('/uploads/', '')
  const filePath = path.join(UPLOADS_DIR, fileName)
  return await fs.readFile(filePath)
}

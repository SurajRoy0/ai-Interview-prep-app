import { fileTypeFromBuffer } from 'file-type'

/**
 * Validates that the provided buffer contains a valid PDF by checking magic bytes.
 * This prevents users from uploading executable files disguised as PDFs.
 */
export async function validatePdf(buffer: Buffer): Promise<boolean> {
  try {
    const type = await fileTypeFromBuffer(buffer)
    
    if (!type) {
      return false
    }

    return type.mime === 'application/pdf' && type.ext === 'pdf'
  } catch (error) {
    console.error('File validation failed:', error)
    return false
  }
}

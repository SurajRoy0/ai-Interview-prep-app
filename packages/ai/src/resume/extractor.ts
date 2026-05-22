import pdf from 'pdf-parse'

/**
 * Extracts raw text from a PDF buffer.
 */
export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  try {
    const data = await pdf(buffer)
    return data.text
  } catch (error) {
    console.error('Failed to extract PDF text:', error)
    throw new Error('Could not parse PDF document')
  }
}

// @ts-ignore - Bypassing buggy index.js entry point which lacks types for the internal path
import pdfParse from 'pdf-parse/lib/pdf-parse.js';
import * as mammoth from 'mammoth';

export async function extractTextFromFileBuffer(buffer: Buffer, mimeType: string): Promise<string> {
  try {
    if (mimeType === 'application/pdf') {
      const data = await pdfParse(buffer);
      return data.text;
    }

    if (
      mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      mimeType === 'application/msword'
    ) {
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    }

    if (mimeType === 'text/plain') {
      return buffer.toString('utf-8');
    }

    throw new Error(`Unsupported file type: ${mimeType}`);
  } catch (error) {
    console.error('[extractTextFromFileBuffer] Failed to extract text:', error);
    throw new Error('Failed to extract text from document');
  }
}

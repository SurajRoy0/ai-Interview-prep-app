// File storage (local disk / R2) — implement when resume upload API is built.

export async function uploadFile(_key: string, _data: Buffer): Promise<string> {
  return ''
}

export async function getSignedUrl(_key: string): Promise<string> {
  return ''
}

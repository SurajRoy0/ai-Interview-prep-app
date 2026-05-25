import { simulateCodeExecution } from '@repo/ai';
import { getSession } from '@/lib/auth-server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const session = await getSession();
  if (!session?.user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const { code, language } = await req.json();

  if (!code) {
    return NextResponse.json({ output: 'Error: No code provided.' }, { status: 400 });
  }

  try {
    const output = await simulateCodeExecution(code, language);
    return NextResponse.json({ output });
  } catch (error) {
    console.error("Compilation error:", error);
    return NextResponse.json({ output: "Internal Server Error executing code." }, { status: 500 });
  }
}

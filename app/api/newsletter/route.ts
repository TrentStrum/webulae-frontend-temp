import { NextRequest, NextResponse } from 'next/server';

const subscribers = new Set<string>();

export async function POST(req: NextRequest): Promise<Response> {
  const { email } = await req.json();
  if (typeof email !== 'string') {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
  }
  subscribers.add(email);
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest): Promise<Response> {
  const { email } = await req.json();
  if (typeof email !== 'string') {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
  }
  subscribers.delete(email);
  return NextResponse.json({ success: true });
}

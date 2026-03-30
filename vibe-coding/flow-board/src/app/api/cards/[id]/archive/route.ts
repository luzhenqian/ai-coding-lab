import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { archiveCard, restoreCard } from '@/lib/actions';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { action, columnId } = await req.json();
  if (action === 'restore') {
    restoreCard(getDb(), id, columnId);
  } else {
    archiveCard(getDb(), id);
  }
  return NextResponse.json({ ok: true });
}

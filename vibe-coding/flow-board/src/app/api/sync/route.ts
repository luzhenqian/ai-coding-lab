import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getArchivedCards } from '@/lib/actions';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const boardId = searchParams.get('boardId');
  if (!boardId) return NextResponse.json({ error: 'boardId required' }, { status: 400 });
  const archived = getArchivedCards(getDb(), boardId);
  return NextResponse.json({ archived });
}

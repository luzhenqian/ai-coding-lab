import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { createChecklistItem } from '@/lib/actions';

export async function POST(req: Request) {
  const { cardId, text } = await req.json();
  const item = createChecklistItem(getDb(), cardId, text);
  return NextResponse.json(item, { status: 201 });
}

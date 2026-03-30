import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { createCard, updatePositions } from '@/lib/actions';

export async function POST(req: Request) {
  const { columnId, ...data } = await req.json();
  const card = createCard(getDb(), columnId, data);
  return NextResponse.json(card, { status: 201 });
}

export async function PUT(req: Request) {
  const { items } = await req.json();
  updatePositions(getDb(), 'cards', items);
  return NextResponse.json({ ok: true });
}

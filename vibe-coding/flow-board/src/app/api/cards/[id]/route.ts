import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { updateCard, deleteCard } from '@/lib/actions';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const changes = await req.json();
  const card = updateCard(getDb(), id, changes);
  return NextResponse.json(card);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  deleteCard(getDb(), id);
  return NextResponse.json({ ok: true });
}

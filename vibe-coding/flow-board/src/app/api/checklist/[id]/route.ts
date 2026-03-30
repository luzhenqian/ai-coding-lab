import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { updateChecklistItem, deleteChecklistItem } from '@/lib/actions';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const changes = await req.json();
  const item = updateChecklistItem(getDb(), id, changes);
  return NextResponse.json(item);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  deleteChecklistItem(getDb(), id);
  return NextResponse.json({ ok: true });
}

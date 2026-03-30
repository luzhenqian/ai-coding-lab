import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { updateColumn, deleteColumn } from '@/lib/actions';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const changes = await req.json();
  const column = updateColumn(getDb(), id, changes);
  return NextResponse.json(column);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  deleteColumn(getDb(), id);
  return NextResponse.json({ ok: true });
}

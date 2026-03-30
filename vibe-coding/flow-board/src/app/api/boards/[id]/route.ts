import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { updateBoard, deleteBoard, getBoardWithData } from '@/lib/actions';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const board = getBoardWithData(getDb(), id);
  if (!board) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(board);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const changes = await req.json();
  const board = updateBoard(getDb(), id, changes);
  return NextResponse.json(board);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  deleteBoard(getDb(), id);
  return NextResponse.json({ ok: true });
}

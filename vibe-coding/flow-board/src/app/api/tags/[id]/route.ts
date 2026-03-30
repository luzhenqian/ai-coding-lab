import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { deleteTag } from '@/lib/actions';

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  deleteTag(getDb(), id);
  return NextResponse.json({ ok: true });
}

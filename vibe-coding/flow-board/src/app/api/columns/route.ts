import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { createColumn, updatePositions } from '@/lib/actions';

export async function POST(req: Request) {
  const { boardId, title, color } = await req.json();
  const column = createColumn(getDb(), boardId, title, color);
  return NextResponse.json(column, { status: 201 });
}

export async function PUT(req: Request) {
  const { items } = await req.json();
  updatePositions(getDb(), 'columns', items);
  return NextResponse.json({ ok: true });
}

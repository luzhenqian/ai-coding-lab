import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getBoards, createBoard, updatePositions } from '@/lib/actions';

export async function GET() {
  const boards = getBoards(getDb());
  return NextResponse.json(boards);
}

export async function POST(req: Request) {
  const { title } = await req.json();
  const board = createBoard(getDb(), title);
  return NextResponse.json(board, { status: 201 });
}

export async function PUT(req: Request) {
  const { items } = await req.json();
  updatePositions(getDb(), 'boards', items);
  return NextResponse.json({ ok: true });
}

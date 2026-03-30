import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getTags, createTag, addCardTag, removeCardTag } from '@/lib/actions';

export async function GET() {
  return NextResponse.json(getTags(getDb()));
}

export async function POST(req: Request) {
  const { name, color, cardId, tagId, action } = await req.json();
  if (action === 'link') {
    addCardTag(getDb(), cardId, tagId);
    return NextResponse.json({ ok: true });
  }
  if (action === 'unlink') {
    removeCardTag(getDb(), cardId, tagId);
    return NextResponse.json({ ok: true });
  }
  const tag = createTag(getDb(), name, color);
  return NextResponse.json(tag, { status: 201 });
}

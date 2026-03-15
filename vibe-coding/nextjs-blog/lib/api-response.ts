import { NextResponse } from "next/server";

export function successResponse(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

export function errorResponse(
  error: string,
  status = 500,
  details?: unknown
) {
  const body: { error: string; details?: unknown } = { error };
  if (details !== undefined) body.details = details;
  return NextResponse.json(body, { status });
}

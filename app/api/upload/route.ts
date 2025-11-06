import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  // Handle file upload
  return NextResponse.json({ success: true });
}

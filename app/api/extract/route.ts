import { NextResponse } from 'next/server';
import * as pdf from 'pdf-parse';
import { extractClausesFromText } from '@/lib/parser';

export async function POST(request: Request) {
  const body = await request.json();
  const pdfUrl = body.pdfUrl;

  if (!pdfUrl) {
    return NextResponse.json({ error: 'pdfUrl is required' }, { status: 400 });
  }

  try {
    // Fetch the PDF from the public URL
    const response = await fetch(pdfUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch PDF: ${response.statusText}`);
    }
    const buffer = await response.arrayBuffer();

    // Parse the PDF buffer
    // @ts-ignore
    const data = await pdf.default(buffer);

    // Extract clauses using our heuristic
    const clauses = extractClausesFromText(data.text);

    return NextResponse.json({ clauses });

  } catch (error: any) {
    console.error('Error processing PDF:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

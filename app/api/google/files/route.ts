import { NextResponse } from 'next/server';
import { listSpreadsheets } from '@/lib/google-sheets';

export async function GET() {
  try {
    const files = await listSpreadsheets();
    return NextResponse.json({ files });
  } catch (error: any) {
    if (error.message.includes('not authenticated')) {
       return NextResponse.json({ error: 'authentication_required' }, { status: 401 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

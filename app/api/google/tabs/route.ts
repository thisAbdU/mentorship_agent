import { NextResponse } from 'next/server';
import { getSpreadsheetTabs } from '@/lib/google-sheets';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const fileId = searchParams.get('fileId');

  if (!fileId) {
    return NextResponse.json({ error: 'fileId query parameter is required' }, { status: 400 });
  }

  try {
    const tabs = await getSpreadsheetTabs(fileId);
    return NextResponse.json({ tabs });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

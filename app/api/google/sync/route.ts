import { NextResponse } from 'next/server';
import { getSheetValues } from '@/lib/google-sheets';
import { mapSheetDataWithAI } from '@/lib/ai-mapping';

export async function POST(request: Request) {
  try {
    const { fileId, tabName } = await request.json();

    if (!fileId || !tabName) {
      return NextResponse.json({ error: 'fileId and tabName are required' }, { status: 400 });
    }

    // We fetch a wide range to capture the header row and subsequent data
    const rawData = await getSheetValues(fileId, `${tabName}!A1:Z500`); 
    
    if (!rawData || rawData.length === 0) {
      return NextResponse.json({ students: [] });
    }

    // Call the AI mapping logic (Local Ollama or API-based Open Source models)
    const validStudents = await mapSheetDataWithAI(rawData);

    return NextResponse.json({ 
      success: true, 
      count: validStudents.length, 
      students: validStudents 
    });
  } catch (error: any) {
    console.error('Error during sheet sync mapping:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

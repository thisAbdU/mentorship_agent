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

    // Update the student database with AI-mapped data
    try {
      const dbResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          students: validStudents,
          source: 'google-sheets-ai',
          fileId,
          tabName
        })
      });
      
      const dbResult = await dbResponse.json();
      console.log('✅ Database updated with AI-mapped students:', dbResult.count);
    } catch (dbError) {
      console.error('Failed to update database:', dbError);
    }

    return NextResponse.json({ 
      success: true, 
      count: validStudents.length, 
      students: validStudents,
      source: 'ai-mapped'
    });
  } catch (error: any) {
    console.error('Error during sheet sync mapping:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

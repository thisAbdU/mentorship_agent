/**
 * This utility handles mapping raw Google Sheet data to a structured Student schema
 * using Open Source AI models (via Ollama locally or Groq/OpenRouter APIs).
 */

export interface StudentRecord {
  name: string;
  email: string;
  studentId: string;
  githubUsername?: string;
  telegramUsername?: string;
  metadata: Record<string, any>;
}

/**
 * AI Mapping function
 * @param rawData The 2D array from Google Sheets (including headers)
 */
export async function mapSheetDataWithAI(rawData: any[][]): Promise<StudentRecord[]> {
  const apiKey = process.env.AI_MAPPING_API_KEY;
  const apiEndpoint = process.env.AI_MAPPING_ENDPOINT || 'http://localhost:11434/v1/chat/completions'; // Default to Ollama
  const modelName = process.env.AI_MAPPING_MODEL || 'llama3';

  // Prepare a condensed version of the data to save tokens/context
  const headers = rawData[0];
  const sampleRows = rawData.slice(1, 10); // Send first 10 rows for pattern matching
  
  const prompt = `
    You are an expert data analyst for a Mentorship & Course Tracking platform. 
    I have a Google Sheet containing student progress data.
    
    Headers: ${JSON.stringify(headers)}
    Sample Data: ${JSON.stringify(sampleRows)}

    Your task:
    1. Identify the following fields from the sheet: 
       - "name": Found in the "Name" column.
       - "githubUsername": Look for GitHub profile URLs or usernames.
       - "telegramUsername": Look for Telegram handles or usernames.
       - "currentModule": Found in the "Topic" column.
       - "status": Found in the "Status" column.
       - "devLevel": Found in the "Dev Level" column.
       - "remarks": Found in the "Remarks" column.
    
    2. Map the data into a JSON array of objects.
    3. Use the keys: "name", "githubUsername", "telegramUsername", "currentModule", "status", "devLevel", and "remarks".
    4. Since "Email" or "Student ID" are missing in this sheet, leave them as empty strings if needed, or focus on the provided columns.
    5. Put "Estimated Time", "Start Date", and "Last Update" into a "metadata" object.
    
    Return ONLY the valid JSON array.
  `;

  try {
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey ? { 'Authorization': `Bearer ${apiKey}` } : {}),
      },
      body: JSON.stringify({
        model: modelName,
        messages: [{ role: 'system', content: 'You are a data mapper. Return only valid JSON array.' }, { role: 'user', content: prompt }],
        temperature: 0,
      }),
    });

    const result = await response.json();
    if (!result.choices || !result.choices[0]) {
       throw new Error("Invalid AI response structure");
    }
    
    let content = result.choices[0].message.content.trim();
    
    // Attempt to extract JSON if the AI included markdown blocks
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      content = jsonMatch[0];
    }

    return JSON.parse(content);
  } catch (error) {
    console.error("AI Mapping Error (Switching to manual fallback):", error);
    
    const headerMap = headers.map((h: any) => String(h).toLowerCase().trim());
    return rawData.slice(1).map((row) => {
      const record: StudentRecord = { name: '', email: '', studentId: '', metadata: {} };
      headerMap.forEach((h, i) => {
        const val = row[i] || '';
        if (h.includes('name')) record.name = val;
        else if (h.includes('mail')) record.email = val;
        else if (h.includes('id')) record.studentId = val;
        else if (h.includes('github')) record.githubUsername = val;
        else if (h.includes('telegram')) record.telegramUsername = val;
        else record.metadata[h] = val;
      });
      return record;
    }).filter(r => r.name || r.email || r.githubUsername);

  } catch (error) {
    console.error("AI Mapping Error:", error);
    throw new Error("Failed to analyze sheet with AI.");
  }
}

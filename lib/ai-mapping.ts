/**
 * This utility handles mapping raw Google Sheet data to a structured Student schema
 * using Open Source AI models via Ollama Cloud or local Ollama instance.
 * 
 * Environment Variables:
 * - AI_MAPPING_API_KEY: Required for Ollama Cloud
 * - AI_MAPPING_ENDPOINT: API endpoint (e.g., https://api.ollama.com/v1/chat/completions)
 * - AI_MAPPING_MODEL: Model name (e.g., llama3)
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
  const apiEndpoint = process.env.AI_MAPPING_ENDPOINT || 'http://localhost:11434/v1/chat/completions';
  const modelName = process.env.AI_MAPPING_MODEL || 'llama3';

  // Validate required configuration
  if (!apiEndpoint) {
    throw new Error('AI_MAPPING_ENDPOINT environment variable is required');
  }

  // For cloud endpoints, API key is required
  if (apiEndpoint.includes('cloud') && !apiKey) {
    throw new Error('AI_MAPPING_API_KEY is required for Ollama Cloud');
  }

  // Prepare data for AI processing
  const headers = rawData[0];
  const allRows = rawData.slice(1); // Send all rows for complete mapping
  
  const prompt = `
    You are an expert data analyst for a Mentorship & Course Tracking platform. 
    I have a Google Sheet containing student data with these headers: ${JSON.stringify(headers)}
    
    Your task:
    1. DYNAMIC FIELD MAPPING: Analyze ALL columns and intelligently map them to these required fields:
       - "name": Student's full name (find name, full name, student name columns)
       - "email": Email address (find email, email address, contact columns)
       - "githubUsername": GitHub username (find github, github username, handle columns, extract from URLs)
       - "studentId": Student ID (find id, student id, roll number columns)
       - "currentModule": Current topic/module (find module, topic, lesson, current status columns)
       - "totalModules": Total modules (estimate from curriculum or progress columns)
       - "lastUpdate": Last activity date (find date, updated, last seen columns)
    
    2. INTELLIGENT EXTRACTION:
       - Extract GitHub usernames from URLs (github.com/username)
       - Handle missing data gracefully
       - Create realistic data for missing fields
       - Generate appropriate status based on available data
    
    3. Map ALL ${allRows.length} rows from the sheet
    4. Return JSON array with complete student objects
    5. Use these exact keys: "name", "email", "githubUsername", "studentId", "currentModule", "totalModules", "lastUpdate"
    6. For missing fields, use logical defaults or empty strings
    
    Be flexible and adaptive to different sheet structures. Focus on data quality and completeness.
    
    Headers detected: ${headers.join(', ')}
    Sample rows: ${JSON.stringify(allRows.slice(0, 3))}
  `;

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add authorization header for cloud endpoints
    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }

    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: modelName,
        messages: [{ 
          role: 'system', 
          content: 'You are a data mapper. Return only valid JSON array.' 
        }, { 
          role: 'user', 
          content: prompt 
        }],
        temperature: 0,
        max_tokens: 4000, // Ensure we get complete response
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed: ${response.status} - ${errorText}`);
    }

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
    
    // Fallback to manual mapping if AI fails
    try {
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
    } catch (fallbackError) {
      console.error("Manual mapping also failed:", fallbackError);
      throw new Error("Failed to analyze sheet with AI and manual fallback.");
    }
  }
}

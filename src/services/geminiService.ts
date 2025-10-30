const GEMINI_API_KEY = 'AIzaSyAyOBLuNaX6PjdMKMVXRkZCwPHurFm7ZAE';

// Try multiple model names and API versions - some models may be deprecated or region-specific
const GEMINI_ENDPOINTS = [
  // Try newer models first
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${GEMINI_API_KEY}`,
];

// Function to list available models
async function listAvailableModels(): Promise<string[]> {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`
    );
    if (response.ok) {
      const data = await response.json();
      return data.models?.map((m: any) => m.name) || [];
    }
  } catch (error) {
    console.error('Failed to list models:', error);
  }
  return [];
}

export interface GeneratedJobDetails {
  title: string;
  description: string;
  requirements: string[];
  location: string;
  salary: {
    min: number;
    max: number;
    currency: string;
  };
  tags: string[];
}

export async function generateJobFromDescription(description: string): Promise<GeneratedJobDetails> {
  const prompt = `You are an HR professional creating a job posting. Based on the following job description, generate a complete job posting with the following structure. Return ONLY a valid JSON object with no markdown formatting, no code blocks, just the raw JSON:

{
  "title": "Job Title (e.g., Senior Frontend Developer)",
  "description": "A detailed job description paragraph (2-3 sentences)",
  "requirements": ["Requirement 1", "Requirement 2", "Requirement 3", "Requirement 4", "Requirement 5"],
  "location": "Location (e.g., San Francisco, CA or Remote)",
  "salary": {
    "min": 80000,
    "max": 120000,
    "currency": "INR"
  },
  "tags": ["tag1", "tag2", "tag3", "tag4"]
}
 
  // prompt defined above

// (assessment generation definitions appended after job generation below)

Job description provided by user:
${description}

Generate a professional job posting JSON object:`;

  try {
    const requestBody = JSON.stringify({
      contents: [{
        parts: [{
          text: prompt
        }]
      }]
    });

    // Build list of endpoints to try
    let endpointsToTry = [...GEMINI_ENDPOINTS];
    
    // First, try to list available models to see what's actually available
    console.log('Checking available Gemini models...');
    const availableModels = await listAvailableModels();
    if (availableModels.length > 0) {
      console.log('Available models:', availableModels);
      // Extract model names and build endpoints from available models
      const modelNames = availableModels
        .map((name: string) => {
          // Extract model name from full path (e.g., "models/gemini-1.5-flash" -> "gemini-1.5-flash")
          const match = name.match(/models\/(.+)$/);
          return match ? match[1] : null;
        })
        .filter((name): name is string => name !== null && !name.includes('/'))
        .filter((name) => !/embedding/i.test(name));
      
      // Add endpoints from available models (prioritize them)
      if (modelNames.length > 0) {
        const additionalEndpoints = modelNames
          .filter(model => !endpointsToTry.some(url => url.includes(`models/${model}:`)))
          .map(model => 
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`
          );
        // Add available models to the front of the list to prioritize them
        endpointsToTry = [...additionalEndpoints, ...endpointsToTry];
      }
    }

    let lastError: Error | null = null;
    
    // Helper: retry with backoff on 429
    const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));
    const requestWithRetry = async (url: string, body: string) => {
      const maxRetries = 3;
      let attempt = 0;
      let lastText = '';
      while (attempt <= maxRetries) {
        const resp = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body });
        lastText = await resp.text();
        if (resp.status !== 429) return { resp, text: lastText };
        await delay(500 * Math.pow(2, attempt));
        attempt += 1;
      }
      return { resp: new Response(lastText, { status: 429 }), text: lastText };
    };

    // Try different endpoints in order
    for (const url of endpointsToTry) {
      try {
        console.log('Trying Gemini API:', url);
        const { resp: response, text: responseText } = await requestWithRetry(url, requestBody);

        console.log('Gemini API response status:', response.status, response.statusText);

        if (!response.ok) {
          // Try to get error details from response
          let errorMessage = `Gemini API error: ${response.status} ${response.statusText}`;
          try {
            const errorData = JSON.parse(responseText);
            if (errorData.error) {
              errorMessage += ` - ${errorData.error.message || JSON.stringify(errorData.error)}`;
            }
          } catch (e) {
            // If response isn't JSON, use text
            if (responseText) {
              errorMessage += ` - ${responseText.substring(0, 200)}`;
            }
          }
          lastError = new Error(errorMessage);
          continue; // Try next endpoint
        }

        // Success! Parse the response
        const data = JSON.parse(responseText);
  
        // Extract text from Gemini response
        const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!generatedText) {
          lastError = new Error('No content generated from Gemini API');
          continue; // Try next endpoint
        }

        // Try to extract JSON from the response (may be wrapped in markdown)
        let jsonText = generatedText.trim();
        
        // Remove markdown code blocks if present
        if (jsonText.startsWith('```')) {
          jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        }
        
        // Remove any leading/trailing text before/after JSON object
        const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          jsonText = jsonMatch[0];
        }

        const parsed = JSON.parse(jsonText);
        
        // Validate and ensure proper structure
        const generatedJob: GeneratedJobDetails = {
          title: parsed.title || 'Untitled Job',
          description: parsed.description || description,
          requirements: Array.isArray(parsed.requirements) ? parsed.requirements : [],
          location: parsed.location || 'Remote',
          salary: {
            min: parsed.salary?.min || 50000,
            max: parsed.salary?.max || 100000,
            currency: parsed.salary?.currency || 'INR'
          },
          tags: Array.isArray(parsed.tags) ? parsed.tags : []
        };

        console.log('Successfully generated job from Gemini API');
        return generatedJob;
      } catch (fetchError: any) {
        console.error(`Error with endpoint ${url}:`, fetchError);
        lastError = fetchError instanceof Error ? fetchError : new Error(String(fetchError));
        continue; // Try next endpoint
      }
    }
    
    // If all endpoints failed, throw the last error
    throw lastError || new Error('Failed to connect to Gemini API');
  } catch (error) {
    console.error('Error generating job from description:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate job details. Please try again or create manually.';
    throw new Error(errorMessage);
  }
}

// ===== Assessments Generation =====
export type GeneratedQuestionType = 'single-choice' | 'multiple-choice' | 'short-text' | 'long-text' | 'numeric' | 'file-upload';

export interface GeneratedAssessmentQuestion {
  id: string;
  type: GeneratedQuestionType;
  title: string;
  description?: string;
  required: boolean;
  options?: string[];
  min?: number;
  max?: number;
  maxLength?: number;
}

export interface GeneratedAssessmentDetails {
  title: string;
  description: string;
  questions: GeneratedAssessmentQuestion[];
}

export async function generateAssessmentFromBrief(brief: string, role: string): Promise<GeneratedAssessmentDetails> {
  const prompt = `You are an experienced assessment designer for hiring. Based on the brief and role below, generate a structured assessment.

Return ONLY valid JSON with this shape (no markdown, no commentary):
{
  "title": "Assessment title",
  "description": "Short description",
  "questions": [
    {
      "id": "q1",
      "type": "single-choice|multiple-choice|short-text|long-text|numeric|file-upload",
      "title": "Question text",
      "description": "Optional helper text",
      "required": true,
      "options": ["A","B","C"],
      "min": 0,
      "max": 10,
      "maxLength": 200
    }
  ]
}

Rules:
- Prefer 6-10 questions balanced across: single-choice, multiple-choice, short-text, long-text, numeric (with min/max), and one file-upload (e.g., portfolio/case study).
- For numeric questions always include sensible min/max.
- For text questions include maxLength (100 for short, 500 for long) when appropriate.
- For choice questions always include 3-5 options.

Role: ${role}
Brief: ${brief}
Generate the JSON now:`;

  const requestBody = JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] });

  let endpointsToTry = [...GEMINI_ENDPOINTS];
  const availableModels = await listAvailableModels();
  if (availableModels.length > 0) {
    const modelNames = availableModels
      .map((name: string) => name.match(/models\/(.+)$/)?.[1] || null)
      .filter((n): n is string => !!n && !n.includes('/'))
      .filter((n) => !/embedding/i.test(n));
    const additional = modelNames
      .filter(m => !endpointsToTry.some(url => url.includes(`models/${m}:`)))
      .map(m => `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${GEMINI_API_KEY}`);
    endpointsToTry = [...additional, ...endpointsToTry];
  }

  let lastError: Error | null = null;
  // Retry helper on 429
  const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));
  const requestWithRetry = async (url: string, body: string) => {
    const maxRetries = 3; let attempt = 0; let lastText = '';
    while (attempt <= maxRetries) {
      const resp = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body });
      lastText = await resp.text();
      if (resp.status !== 429) return { resp, text: lastText };
      await delay(500 * Math.pow(2, attempt));
      attempt += 1;
    }
    return { resp: new Response(lastText, { status: 429 }), text: lastText };
  };

  for (const url of endpointsToTry) {
    try {
      const { resp: response, text: responseText } = await requestWithRetry(url, requestBody);
      if (!response.ok) { lastError = new Error(`${response.status} ${response.statusText} - ${responseText.substring(0,200)}`); continue; }
      const data = JSON.parse(responseText);
      let text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      if (!text) { lastError = new Error('No content generated'); continue; }
      if (text.startsWith('```')) text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const match = text.match(/\{[\s\S]*\}/);
      if (match) text = match[0];

      const parsed = JSON.parse(text);
      const questions: GeneratedAssessmentQuestion[] = Array.isArray(parsed.questions) ? parsed.questions.map((q: any, idx: number) => ({
        id: q.id || `q${idx+1}`,
        type: (q.type || 'short-text') as GeneratedQuestionType,
        title: q.title || `Question ${idx+1}`,
        description: q.description || undefined,
        required: typeof q.required === 'boolean' ? q.required : true,
        options: Array.isArray(q.options) ? q.options : undefined,
        min: typeof q.min === 'number' ? q.min : undefined,
        max: typeof q.max === 'number' ? q.max : undefined,
        maxLength: typeof q.maxLength === 'number' ? q.maxLength : undefined
      })) : [];

      return {
        title: parsed.title || `${role} Assessment`,
        description: parsed.description || 'Auto-generated assessment.',
        questions
      };
    } catch (e: any) {
      lastError = e instanceof Error ? e : new Error(String(e));
      continue;
    }
  }
  throw lastError || new Error('Failed to generate assessment');
}

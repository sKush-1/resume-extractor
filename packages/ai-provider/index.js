'use strict';

const { createLogger } = require('@resume-etl/logger');

const logger = createLogger('ai-provider');

/**
 * System prompt for resume extraction.
 * Forces strict JSON output.
 */
const EXTRACTION_SYSTEM_PROMPT = `You are a resume data extraction assistant. 
Extract structured information from the given resume text.
You MUST respond with ONLY valid JSON matching this exact schema:

{
  "name": "string (full name)",
  "email": "string (email address or empty string)",
  "phone": "string (phone number or empty string)",
  "skills": ["array of skill strings"],
  "experience_years": "string (total years of experience, e.g. '5' or '3-5')",
  "education": ["array of education entries, e.g. 'B.Tech in Computer Science, XYZ University, 2020'"],
  "companies": ["array of company names the candidate has worked at"],
  "location": "string (city/state/country or empty string)"
}

Rules:
- Return ONLY the JSON object, no markdown, no explanation.
- If a field cannot be determined, use empty string or empty array.
- Skills should be individual skill names, not sentences.
- Companies should be just company names.
- Experience years should be a number or range.`;

/**
 * User prompt wrapper for resume text.
 * @param {string} resumeText
 * @returns {string}
 */
function buildUserPrompt(resumeText) {
    return `Extract structured data from this resume:\n\n${resumeText}`;
}

/**
 * Parse and validate the AI response JSON.
 * @param {string} responseText
 * @returns {object} Parsed candidate data
 */
function parseAIResponse(responseText) {
    let text = responseText.trim();

    // Strip markdown code fences if present
    if (text.startsWith('```')) {
        text = text.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '');
    }

    const data = JSON.parse(text);

    return {
        name: String(data.name || ''),
        email: String(data.email || ''),
        phone: String(data.phone || ''),
        skills: Array.isArray(data.skills) ? data.skills.map(String) : [],
        experience_years: String(data.experience_years || ''),
        education: Array.isArray(data.education) ? data.education.map(String) : [],
        companies: Array.isArray(data.companies) ? data.companies.map(String) : [],
        location: String(data.location || ''),
    };
}

// ─── Ollama Adapter ──────────────────────────────────

class OllamaAdapter {
    constructor(config) {
        this._baseUrl = config.baseUrl;
        this._model = config.model;
    }

    async extractResumeData(text) {
        const response = await fetch(`${this._baseUrl}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: this._model,
                messages: [
                    { role: 'system', content: EXTRACTION_SYSTEM_PROMPT },
                    { role: 'user', content: buildUserPrompt(text) },
                ],
                stream: false,
                format: 'json',
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Ollama API error (${response.status}): ${errorText}`);
        }

        const result = await response.json();
        const content = result.message?.content || '';

        logger.debug('Ollama response received', { model: this._model });
        return parseAIResponse(content);
    }
}

// ─── OpenAI Adapter ──────────────────────────────────

class OpenAIAdapter {
    constructor(config) {
        this._apiKey = config.apiKey;
        this._model = config.model;
    }

    async extractResumeData(text) {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this._apiKey}`,
            },
            body: JSON.stringify({
                model: this._model,
                messages: [
                    { role: 'system', content: EXTRACTION_SYSTEM_PROMPT },
                    { role: 'user', content: buildUserPrompt(text) },
                ],
                temperature: 0.1,
                response_format: { type: 'json_object' },
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`OpenAI API error (${response.status}): ${errorText}`);
        }

        const result = await response.json();
        const content = result.choices?.[0]?.message?.content || '';

        logger.debug('OpenAI response received', { model: this._model });
        return parseAIResponse(content);
    }
}

// ─── Gemini Adapter ──────────────────────────────────

class GeminiAdapter {
    constructor(config) {
        this._apiKey = config.apiKey;
        this._model = config.model;
    }

    async extractResumeData(text) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${this._model}:generateContent?key=${this._apiKey}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            { text: `${EXTRACTION_SYSTEM_PROMPT}\n\n${buildUserPrompt(text)}` },
                        ],
                    },
                ],
                generationConfig: {
                    temperature: 0.1,
                    responseMimeType: 'application/json',
                },
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Gemini API error (${response.status}): ${errorText}`);
        }

        const result = await response.json();
        const content =
            result.candidates?.[0]?.content?.parts?.[0]?.text || '';

        logger.debug('Gemini response received', { model: this._model });
        return parseAIResponse(content);
    }
}

// ─── Factory ─────────────────────────────────────────

/**
 * Create an AI provider based on config.
 * @param {object} aiConfig
 * @returns {OllamaAdapter|OpenAIAdapter|GeminiAdapter}
 */
function createAIProvider(aiConfig) {
    switch (aiConfig.provider) {
        case 'ollama':
            return new OllamaAdapter(aiConfig.ollama);
        case 'openai':
            if (!aiConfig.openai.apiKey) {
                throw new Error('OPENAI_API_KEY is required when AI_PROVIDER=openai');
            }
            return new OpenAIAdapter(aiConfig.openai);
        case 'gemini':
            if (!aiConfig.gemini.apiKey) {
                throw new Error('GEMINI_API_KEY is required when AI_PROVIDER=gemini');
            }
            return new GeminiAdapter(aiConfig.gemini);
        default:
            throw new Error(`Unknown AI provider: ${aiConfig.provider}`);
    }
}

module.exports = {
    OllamaAdapter,
    OpenAIAdapter,
    GeminiAdapter,
    createAIProvider,
    parseAIResponse,
    EXTRACTION_SYSTEM_PROMPT,
};

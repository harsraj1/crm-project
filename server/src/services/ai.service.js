import OpenAI from 'openai';

// Initialize OpenAI client if API key is available
let openai = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

// Hugging Face inference configuration
const HF_API_URL = 'https://api-inference.huggingface.co/models/';
const HF_MODEL = process.env.HF_MODEL || 'mistralai/Mistral-7B-Instruct-v0.2';
const HF_TOKEN = process.env.HF_TOKEN;

export const processAiSummary = async (data) => {
  const { leadId, type = 'summary', context } = data;

  // Skip if no AI provider is configured
  const aiProvider = process.env.AI_PROVIDER || 'openai';
  if (aiProvider === 'openai' && (!openai || !openai.apiKey)) {
    console.warn('⚠️ OpenAI API key not configured, skipping AI processing');
    return;
  }
  if (aiProvider === 'huggingface' && !HF_TOKEN) {
    console.warn('⚠️ Hugging Face token not configured, skipping AI processing');
    return;
  }

  try {
    const Lead = (await import('../models/Lead.js')).Lead;
    const lead = await Lead.findById(leadId).lean();
    if (!lead) return console.warn(`Lead ${leadId} not found for AI summary`);

    const prompt = buildPrompt(lead, type, context);
    let aiResponse;

    if (aiProvider === 'huggingface') {
      aiResponse = await queryHuggingFace(prompt);
    } else {
      // Default to OpenAI
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an AI sales assistant. Provide concise, actionable insights.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 500,
        temperature: 0.3
      });

      aiResponse = completion.choices[0].message.content;
    }

    const updateData = type === 'scoring'
      ? { aiScore: parseScore(aiResponse) }
      : { aiSummary: aiResponse };

    await Lead.findByIdAndUpdate(leadId, updateData);

    console.log(`✅ AI ${type} completed for lead ${leadId} using ${aiProvider}`);
  } catch (error) {
    console.error(`❌ AI processing failed for ${leadId}:`, error.message);
  }
};

const buildPrompt = (lead, type, context) => {
  const baseContext = `
Lead: ${lead.name} (${lead.email})
Company: ${lead.company || 'N/A'}
Status: ${lead.status}
Value: $${lead.value}
Source: ${lead.source}
Notes: ${lead.notes || 'None'}
Activities: ${context?.activities || 'None'}
`;

  const prompts = {
    summary: `Provide a concise summary of this lead for a sales rep preparing for a call. Include: key pain points, decision maker status, urgency, recommended next steps.`,
    scoring: `Score this lead from 0-100 based on: fit, interest, budget, authority, timeline. Return only the number.`,
    insights: `Analyze this lead and provide 3 actionable insights for closing the deal.`
  };

  return `${baseContext}\n${context?.customPrompt || prompts[type] || prompts.summary}`;
};

const parseScore = (text) => {
  const match = text.match(/\d+/);
  return match ? Math.min(100, Math.max(0, parseInt(match[0]))) : 50;
};

// Hugging Face Inference API helper
const queryHuggingFace = async (prompt) => {
  const response = await fetch(`${HF_API_URL}${HF_MODEL}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${HF_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      inputs: prompt,
      parameters: {
        max_new_tokens: 500,
        temperature: 0.3,
        return_full_text: false
      }
    })
  });

  if (!response.ok) {
    throw new Error(`Hugging Face API error: ${response.status}`);
  }

  const result = await response.json();

  // Handle different response formats from HF API
  if (Array.isArray(result) && result[0] && result[0].generated_text) {
    return result[0].generated_text.trim();
  } else if (result.generated_text) {
    return result.generated_text.trim();
  } else if (result[0] && result[0].text) {
    return result[0].text.trim();
  } else {
    throw new Error('Unexpected response format from Hugging Face API');
  }
};
import OpenAI from 'openai';
import { requestAiSummary } from '../kafka/producer.js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const processAiSummary = async (data) => {
  const { leadId, type = 'summary', context } = data;

  if (!openai.apiKey) {
    console.warn('⚠️ OpenAI API key not configured, skipping AI processing');
    return;
  }

  try {
    const Lead = (await import('../models/Lead.js')).Lead;
    const lead = await Lead.findById(leadId).lean();
    if (!lead) return console.warn(`Lead ${leadId} not found for AI summary`);

    const prompt = buildPrompt(lead, type, context);

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are an AI sales assistant. Provide concise, actionable insights.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 500,
      temperature: 0.3
    });

    const aiResponse = completion.choices[0].message.content;

    const updateData = type === 'scoring'
      ? { aiScore: parseScore(aiResponse) }
      : { aiSummary: aiResponse };

    await Lead.findByIdAndUpdate(leadId, updateData);

    console.log(`✅ AI ${type} completed for lead ${leadId}`);
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
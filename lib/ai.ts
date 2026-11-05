import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';

const ClassificationSchema = z.object({
  sentiment: z.enum(['POS','NEU','NEG']),
  sentimentScore: z.number().min(-1).max(1),
  themes: z.array(z.string()).min(1).max(5),
  featureArea: z.string().min(1).max(100),
  rationale: z.string().min(1).max(300)
});

const fallback = (text: string) => {
  const t = text.toLowerCase();
  const negative = ['bad','slow','error','fail','broken','problem','issue','crash','timeout','cannot','can\'t','difficult','poor'];
  const positive = ['love','great','fast','excellent','amazing','easy','good','beautiful','helpful'];
  const neg = negative.filter(w=>t.includes(w)).length, pos = positive.filter(w=>t.includes(w)).length;
  const sentiment = neg > pos ? 'NEG' : pos > neg ? 'POS' : 'NEU';
  const score = sentiment === 'NEG' ? -0.65 : sentiment === 'POS' ? 0.65 : 0;
  const themes = ['General Product Feedback'];
  if (/login|auth|sign in|sso|password/.test(t)) themes[0] = 'Authentication';
  else if (/dashboard|chart|analytics/.test(t)) themes[0] = 'Dashboard';
  else if (/billing|invoice|payment/.test(t)) themes[0] = 'Billing';
  else if (/mobile|phone|responsive/.test(t)) themes[0] = 'Mobile Experience';
  else if (/onboard|invite team/.test(t)) themes[0] = 'Onboarding';
  return { sentiment, sentimentScore: score, themes, featureArea: themes[0], rationale: 'Fallback classification used because ANTHROPIC_API_KEY is not configured.' };
};

export async function classifyFeedback(text: string, existingThemes: string[]) {
  if (!process.env.ANTHROPIC_API_KEY) return fallback(text);
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const prompt = `Classify this customer feedback. Return JSON only with sentiment (POS|NEU|NEG), sentimentScore (-1 to 1), themes (array), featureArea, rationale. Reuse existing themes where appropriate. Existing themes: ${existingThemes.join(', ') || 'none'}\nFeedback: ${text}`;
  const msg = await client.messages.create({ model: process.env.CLAUDE_MODEL || 'claude-sonnet-4-6', max_tokens: 500, messages: [{ role: 'user', content: prompt }] });
  const raw = msg.content.filter(x=>x.type==='text').map(x=>(x as any).text).join('').replace(/^```json\s*/,'').replace(/```$/,'').trim();
  return ClassificationSchema.parse(JSON.parse(raw));
}

export async function groundedAnswer(question: string, feedback: {id:string; content:string}[]) {
  if (!process.env.ANTHROPIC_API_KEY) return { answer: `Based on the ${feedback.length} most relevant feedback items, the available evidence is:\n\n${feedback.slice(0,5).map(x=>`• ${x.content}`).join('\n') || 'No matching feedback was found.'}`, sources: feedback.slice(0,5).map(x=>x.id) };
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const context = feedback.map((x,i)=>`[${i+1}] ${x.content}`).join('\n');
  const msg = await client.messages.create({ model: process.env.CLAUDE_MODEL || 'claude-sonnet-4-6', max_tokens: 800, messages: [{ role:'user', content:`Answer ONLY from the feedback below. If evidence is insufficient, say so. Question: ${question}\n\nFeedback:\n${context}` }] });
  return { answer: msg.content.filter(x=>x.type==='text').map(x=>(x as any).text).join(''), sources: feedback.map(x=>x.id) };
}

import OpenAI from 'openai';

export type ModelUsage = {
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
};

export type GeneratedTextResult = {
  text: string;
  provider: 'responses' | 'chat_completions';
  usage?: ModelUsage;
};

type GenerateTextArgs = {
  client: OpenAI;
  model: string;
  systemPrompt?: string;
  userMessage: string;
  maxOutputTokens: number;
  temperature: number;
};

function extractChatText(content: unknown): string {
  if (typeof content === 'string') return content.trim();
  if (!Array.isArray(content)) return '';

  // Chat content parts are typically: [{ type: 'text', text: '...' }, ...]
  const parts: string[] = [];
  for (const part of content) {
    if (typeof part === 'string') {
      parts.push(part);
      continue;
    }
    if (part && typeof part === 'object' && 'text' in (part as Record<string, unknown>)) {
      const text = (part as { text?: unknown }).text;
      if (typeof text === 'string') parts.push(text);
    }
  }
  return parts.join('').trim();
}

/**
 * Prefer the Responses API. If the provided API key is restricted and lacks
 * `api.responses.write`, fall back to Chat Completions.
 */
export async function generateTextWithOpenAI(args: GenerateTextArgs): Promise<GeneratedTextResult> {
  const { client, model, systemPrompt, userMessage, maxOutputTokens, temperature } = args;

  try {
    const res = await client.responses.create({
      model,
      instructions: systemPrompt,
      input: userMessage,
      max_output_tokens: maxOutputTokens,
      temperature,
    });
    return {
      text: res.output_text?.trim() ?? '',
      provider: 'responses',
      usage: res.usage
        ? {
            inputTokens: res.usage.input_tokens ?? undefined,
            outputTokens: res.usage.output_tokens ?? undefined,
            totalTokens: res.usage.total_tokens ?? undefined,
          }
        : undefined,
    };
  } catch (err) {
    const anyErr = err as {
      status?: number;
      error?: { message?: string };
      message?: string;
    };

    const msg = String(anyErr?.error?.message ?? anyErr?.message ?? '');

    // Some restricted keys are configured for Chat Completions but not Responses.
    if (anyErr?.status === 401 && msg.includes('api.responses.write')) {
      const chat = await client.chat.completions.create({
        model,
        messages: [
          ...(systemPrompt ? [{ role: 'system' as const, content: systemPrompt }] : []),
          { role: 'user' as const, content: userMessage },
        ],
        max_completion_tokens: maxOutputTokens,
        temperature,
      });

      const content = chat.choices?.[0]?.message?.content;
      return {
        text: extractChatText(content),
        provider: 'chat_completions',
        usage: chat.usage
          ? {
              inputTokens: chat.usage.prompt_tokens ?? undefined,
              outputTokens: chat.usage.completion_tokens ?? undefined,
              totalTokens: chat.usage.total_tokens ?? undefined,
            }
          : undefined,
      };
    }

    throw err;
  }
}

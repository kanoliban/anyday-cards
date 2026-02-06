import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

import dotenv from 'dotenv';

// Load local env so OPENAI_API_KEY is available when running this test manually.
dotenv.config({ path: '.env.local' });

type GenerateResponse = {
  message: string;
  version: string;
  isFallback?: boolean;
};

async function callGenerateV2(payload: Record<string, unknown>): Promise<GenerateResponse> {
  // Import the route handler directly so this test exercises our exact server logic,
  // including MessageSpec normalization + validator/repair pass.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { POST } = require('../../app/api/generate-v2/route.ts') as {
    POST: (req: Request) => Promise<Response>;
  };

  const req = new Request('http://localhost/api/generate-v2', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const res = await POST(req);
  assert.equal(res.status, 200, 'Expected 200 from /api/generate-v2');
  const data = (await res.json()) as GenerateResponse;
  assert.ok(typeof data.message === 'string' && data.message.trim().length > 0, 'Expected non-empty message');
  assert.ok(typeof data.version === 'string' && data.version.trim().length > 0, 'Expected version');
  return data;
}

test('AI receipts: 3 branch-tree scenarios (LIVE)', async (t) => {
  if (process.env.LIVE_OPENAI !== '1') {
    t.skip('Set LIVE_OPENAI=1 to run live OpenAI receipt tests (prevents accidental charges).');
    return;
  }

  if (!process.env.OPENAI_API_KEY) {
    t.skip('OPENAI_API_KEY not set.');
    return;
  }

  const model =
    process.env.OPENAI_MODEL && process.env.OPENAI_MODEL.trim()
      ? process.env.OPENAI_MODEL.trim()
      : 'gpt-4.1-mini';

  const scenarios = [
    {
      id: 'friend_birthday_funny_heartfelt',
      payload: {
        recipientName: 'Alex',
        relationship: 'friend',
        occasion: 'birthday',
        cardName: 'Confetti Cake',
        cardTone: 'playful',
        vibes: ['funny', 'heartfelt', 'nostalgic'],
        humorType: 'dryDeadpan',
        heartfeltDepth: 'mightCry', // wizard value (normalized server-side)
        quickTraits: ['coffeeAddict', 'dogPerson', 'overthinker'],
        relationshipDetails: {
          friendTexture: 'bestie',
          friendHowMet: 'We met in a coffee shop during finals week and bonded over panic-studying.',
          friendSharedMemory: 'That late-night road trip where we got lost and laughed until we cried.',
          friendTheyreTheOneWho: 'always answers at 2am and somehow makes everything feel solvable.',
          friendInsideJoke: 'We still say "operational excellence" whenever something goes slightly wrong.',
        },
      },
    },
    {
      id: 'parent_support_heartfelt_encouraging',
      payload: {
        recipientName: 'Dad',
        relationship: 'parent',
        occasion: 'support',
        cardName: 'Quiet Strength',
        cardTone: 'warm',
        vibes: ['heartfelt', 'encouraging'],
        heartfeltDepth: 'warmLight', // wizard value (normalized server-side)
        quickTraits: [],
        relationshipDetails: {
          parentWhich: 'dad',
          parentRelationshipVibe: 'complicated',
          parentTaughtYou: 'To keep showing up, even when it is hard.',
          parentAlwaysSays: '"One day at a time."',
          parentChildhoodMemory: 'Fixing the bike chain together in the driveway.',
        },
        details: 'They are going through a stressful season at work and feeling worn down.',
      },
    },
    {
      id: 'sibling_justbecause_weird_playful',
      payload: {
        recipientName: 'Jamie',
        relationship: 'sibling',
        occasion: 'justBecause',
        cardName: 'Chaos Siblings',
        cardTone: 'playful',
        vibes: ['weird', 'playful'],
        quickTraits: ['gamer', 'alwaysLate', 'creativeMess'],
        relationshipDetails: {
          siblingType: 'brother',
          siblingBirthOrder: 'older',
          siblingDynamicNow: 'lovinglyAnnoying',
          siblingChildhoodMemory: 'Building a blanket fort and declaring it an independent nation.',
          siblingInsideJoke: 'The sacred phrase: "Do not summon the raccoon council."',
        },
      },
    },
  ] as const;

  const receipts: Array<{
    id: string;
    model: string;
    request: Record<string, unknown>;
    response: GenerateResponse;
  }> = [];

  for (const scenario of scenarios) {
    // eslint-disable-next-line no-console
    console.log(`\n[RECEIPT] scenario=${scenario.id} model=${model}`);
    // eslint-disable-next-line no-console
    console.log(`[RECEIPT] request=${JSON.stringify(scenario.payload)}`);

    const res = await callGenerateV2(scenario.payload);

    // If we got a fallback, the test did not hit OpenAI successfully.
    assert.equal(res.isFallback, false, `Expected live model output for ${scenario.id}, got fallback`);

    // eslint-disable-next-line no-console
    console.log(`[RECEIPT] response=${JSON.stringify(res)}`);

    receipts.push({
      id: scenario.id,
      model,
      request: scenario.payload,
      response: res,
    });
  }

  // Also write a local file for easy copy/paste and review.
  fs.writeFileSync('ai-receipts.json', JSON.stringify({ generatedAt: new Date().toISOString(), receipts }, null, 2));
});

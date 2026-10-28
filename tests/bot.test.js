import test from 'node:test';
import assert from 'node:assert/strict';
import { fallbackTweet, makeTweet, runBot, validateTweet } from '../bot.js';

test('dry run never posts or calls AI, even with configured credentials', async () => {
  const never = new Proxy({}, { get() { throw new Error('External call attempted'); } });
  const result = await runBot({ env: { OPENAI_API_KEY: 'fixture' }, dryRun: true, ai: never, twitter: never });
  assert.equal(result.dryRun, true);
  assert(result.text.length > 0);
});

test('AI errors and invalid AI text use a real local fallback', async () => {
  const ai = { chat: { completions: { create: async () => ({ choices: [{ message: { content: '' } }] }) } } };
  const text = await makeTweet({ env: { OPENAI_API_KEY: 'fixture' }, ai });
  assert.equal(validateTweet(text), text);
});

test('missing X credentials fail before attempting to post', async () => {
  await assert.rejects(runBot({ env: {} }), /Missing GitHub repository secrets/);
});

test('one run posts once and returns the provider tweet ID', async () => {
  let calls = 0;
  const twitter = { v2: { tweet: async () => { calls++; return { data: { id: 'test-tweet' } }; } } };
  const env = Object.fromEntries(['TWITTER_API_KEY','TWITTER_API_SECRET','TWITTER_ACCESS_TOKEN','TWITTER_ACCESS_SECRET'].map(key => [key, 'fixture']));
  const result = await runBot({ env, twitter });
  assert.equal(calls, 1);
  assert.equal(result.id, 'test-tweet');
});

test('fallback selection is stable within a day; oversize tweets are rejected', async () => {
  const day = new Date('2026-10-28T00:00:00Z');
  assert.equal(await fallbackTweet(day), await fallbackTweet(day));
  assert.throws(() => validateTweet('x'.repeat(241)));
  assert.throws(() => validateTweet(''));
});

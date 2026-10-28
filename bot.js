import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import OpenAI from 'openai';
import { TwitterApi } from 'twitter-api-v2';

export function validateTweet(text) {
  const tweet = String(text ?? '').trim();
  if (!tweet || [...tweet].length > 240) {
    throw new Error('Tweet must contain 1 to 240 characters.');
  }
  return tweet;
}

export async function fallbackTweet(day = new Date()) {
  const content = await readFile(new URL('./tweets.txt', import.meta.url), 'utf8');
  const tweets = content.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  if (tweets.length === 0) throw new Error('tweets.txt needs at least one tweet.');
  const dayNumber = Math.floor(day.getTime() / 86400000);
  return validateTweet(tweets[dayNumber % tweets.length]);
}

export async function makeTweet({ env = process.env, dryRun = false, ai } = {}) {
  if (!dryRun && env.OPENAI_API_KEY) {
    try {
      const client = ai ?? new OpenAI({ apiKey: env.OPENAI_API_KEY });
      const response = await client.chat.completions.create({
        model: env.OPENAI_MODEL || 'gpt-4o-mini',
        messages: [{
          role: 'user',
          content: 'Write one useful, original software-development tip under 220 characters. No quotes or unsupported claims about current news. Return only the tweet.',
        }],
        max_tokens: 100,
      });
      return validateTweet(response.choices[0]?.message?.content);
    } catch {
      console.warn('AI generation unavailable; using a local fallback tweet.');
    }
  }
  return fallbackTweet();
}

export async function runBot({ env = process.env, dryRun = false, twitter, ai } = {}) {
  // Dry runs never contact either paid AI services or X.
  const text = await makeTweet({ env, dryRun, ai });
  if (dryRun) {
    console.log('[DRY RUN] No tweet was posted:', text);
    return { dryRun: true, text };
  }

  const keys = ['TWITTER_API_KEY', 'TWITTER_API_SECRET', 'TWITTER_ACCESS_TOKEN', 'TWITTER_ACCESS_SECRET'];
  const missing = keys.filter(key => !env[key]);
  if (missing.length) throw new Error('Missing GitHub repository secrets: ' + missing.join(', '));
  const client = twitter ?? new TwitterApi({
    appKey: env.TWITTER_API_KEY,
    appSecret: env.TWITTER_API_SECRET,
    accessToken: env.TWITTER_ACCESS_TOKEN,
    accessSecret: env.TWITTER_ACCESS_SECRET,
  });
  // One attempt per run. Retrying blindly could publish a duplicate after a timeout.
  const result = await client.v2.tweet(text);
  console.log('Tweet posted:', result.data.id);
  return { id: result.data.id, text };
}

export async function main() {
  const dryRun = process.argv.includes('--dry-run') || process.env.DRY_RUN === 'true';
  try {
    await runBot({ dryRun });
  } catch (error) {
    // Do not print SDK request objects, which can include authorization headers.
    console.error('Tweet run failed:', error.message);
    process.exitCode = 1;
  }
}

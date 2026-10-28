# Twitter Auto-Post

Posts one technology tip each day using GitHub Actions. Your computer can be off: GitHub runs the bot in the cloud.

## Automatic posting

1. Open repository Settings → Secrets and variables → Actions.
2. Add TWITTER_API_KEY, TWITTER_API_SECRET, TWITTER_ACCESS_TOKEN, and TWITTER_ACCESS_SECRET as repository secrets.
3. Give the X developer application Read and Write permission and an API plan that allows posting. Regenerate access tokens after enabling write permission.
4. Enable GitHub Actions. Keep the workflow on the default branch.

The schedule is **08:17 East Africa Time daily** (05:17 UTC), in `.github/workflows/tweet.yml`. You do not have to click Run workflow each day. GitHub can delay jobs; public repositories can have schedules disabled after 60 days without repository activity. Re-enable a disabled schedule in Actions.

OPENAI_API_KEY is optional. Without it, the bot selects a line from tweets.txt. Add one tweet per line, up to 240 characters. Selection changes daily and repeats after the end of the file. AI errors also use this fallback. OPENAI_MODEL can override the default model.

## Check without posting

Use Node.js 22 or newer:

```sh
npm ci
npm test
npm run dry-run
```

Dry runs never contact X or OpenAI, even with credentials configured. In Actions, Daily tweet → Run workflow defaults to a dry run. Uncheck that option only when you intend to publish a real tweet.

`npm start` publishes once and exits. Do not run it alongside the scheduled workflow unless you want another tweet. Both entry points use bot.js.

## Troubleshooting

Check the latest Daily tweet run in Actions. Missing credentials, revoked tokens, insufficient X permissions, quotas, or a disabled workflow require attention. The bot makes one posting attempt and reports failures instead of blindly retrying a request that might already have published.

Never commit .env files or API keys. The test workflow runs without publishing anything.

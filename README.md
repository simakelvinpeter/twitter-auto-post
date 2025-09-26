Twitter Auto-Post Bot

A Node.js bot that automatically posts daily tweets using GitHub Actions. It generates tweets via OpenAI GPT or falls back to pre-written tweets from a local file, ensuring consistent and engaging activity on your Twitter account.


Features
Posts one tweet daily at 8:00 AM Cyprus time.
Uses OpenAI GPT to generate tweets (optional; fallback to pre-written tweets if API limits are reached).
Supports hashtags to boost engagement.
Fully automated with GitHub Actions.
Easy to maintain and update pre-written tweets.
Robust fallback system guarantees a tweet is always posted.

Setup

1. Clone the Repository
git clone https://github.com/simakelvinpeter/twitter-auto-post.git
cd twitter-auto-pos


2. Install Dependencies
npm install


This installs all required Node.js packages including:
twitter-api-v2
openai
node-cron
dotenv

3. Configure Secrets
Add the following secrets to your GitHub repository:
Go to Settings → Secrets and Variables → Actions → New repository secret

| Secret Name           | Description                            |
|----------------------|--------------------------------------|
| TWITTER_API_KEY       | Twitter API Key                      |
| TWITTER_API_SECRET    | Twitter API Secret                   |
| TWITTER_ACCESS_TOKEN  | Twitter Access Token                 |
| TWITTER_ACCESS_SECRET | Twitter Access Secret                |
| OPENAI_API_KEY (optional) | OpenAI API Key for AI-generated tweets |

> ⚠️ Ensure secret names match exactly with no spaces or capitalization changes.

4. Add Pre-Written Tweets (Optional)
Create a `tweets.txt` file in the project root. Add one tweet per line, including hashtags if desired:
Example: Excited about the latest AI trends! #AI #Tech
This file acts as a fallback if OpenAI cannot generate a tweet.


5. GitHub Actions Workflow

The bot is scheduled to run daily at 8:00 AM Cyprus time using the workflow defined in `.github/workflows/tweet-bot.yml`.

Workflow steps:

1. Checkout the repository
2. Set up Node.js environment
3. Install dependencies using `npm install`
4. Run the bot using your GitHub repository secrets
5. Logs are available in GitHub Actions for monitoring success or errors

You can also trigger the workflow manually via the `workflow_dispatch` event.

Running Locally (Optional)

You can run the bot locally for testing:

```bash
node postTweet.js

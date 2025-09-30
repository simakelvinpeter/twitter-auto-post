import 'dotenv/config';
import fs from 'fs';
import { TwitterApi } from 'twitter-api-v2';
import OpenAI from 'openai';
import cron from 'node-cron';


const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});


const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_SECRET,
});

// --- Function to get AI-generated content or fallback ---
async function generateTweetContent() {
  try {
    const prompt = `
    You are a social media content creator. 
    Write a short, engaging tweet about the latest tech trend 
    that can spark impressions, likes, and comments. 
    Keep it under 240 characters. 
    Make it conversational and catchy.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 80,
    });

    let tweet = response.choices[0].message.content.trim();

    // Optional: add hashtags
    const hashtags = ['#Tech', '#AI', '#Innovation', '#TechTrends'];
    tweet += ' ' + hashtags.join(' ');

    return tweet;

  } catch (error) {
    console.error("❌ Error generating tweet via OpenAI:", error);

    // fallback: pick a random tweet from tweets.txt
    try {
      const fallbackTweets = fs.readFileSync('tweets.txt', 'utf-8')
        .split('\n')
        .filter(Boolean);
      let tweet = fallbackTweets[Math.floor(Math.random() * fallbackTweets.length)];

      // Optional: add hashtags
      const hashtags = ['#Tech', '#AI', '#Innovation', '#TechTrends'];
      tweet += ' ' + hashtags.join(' ');

      return tweet;
    } catch (fsError) {
      console.error("❌ Error reading tweets.txt:", fsError);
      return "Tech is moving fast! 🚀 Stay tuned for updates!";
    }
  }
}

// --- Function to post Tweet ---
async function postTweet() {
  try {
    const tweetText = await generateTweetContent();
    const response = await twitterClient.v2.tweet(tweetText);
    console.log("✅ Tweet posted successfully:", response.data);
  } catch (error) {
    console.error("❌ Error posting tweet:", error);
  }
}

// --- Schedule daily tweet at 8:00 AM Cyprus time ---
cron.schedule('0 8 * * *', () => {
  console.log("⏰ Running scheduled tweet...");
  postTweet();
}, {
  timezone: "Europe/Nicosia"
});

// Optional: run immediately once to test
postTweet();

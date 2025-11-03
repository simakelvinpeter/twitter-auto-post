import 'dotenv/config';
import fs from 'fs';
import { TwitterApi } from 'twitter-api-v2';
import OpenAI from 'openai';
import cron from 'node-cron';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize Twitter client with error handling
let twitterClient;
try {
  if (!process.env.TWITTER_API_KEY || !process.env.TWITTER_API_SECRET || 
      !process.env.TWITTER_ACCESS_TOKEN || !process.env.TWITTER_ACCESS_SECRET) {
    throw new Error('Missing Twitter credentials');
  }
  
  twitterClient = new TwitterApi({
    appKey: process.env.TWITTER_API_KEY,
    appSecret: process.env.TWITTER_API_SECRET,
    accessToken: process.env.TWITTER_ACCESS_TOKEN,
    accessSecret: process.env.TWITTER_ACCESS_SECRET,
  });
  
  console.log('✅ Twitter client initialized successfully');
} catch (error) {
  console.error('❌ Error initializing Twitter client:', error.message);
  process.exit(1);
}

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
      return "Tech is moving fast! 🚀 Stay tuned for updates! #Tech #AI";
    }
  }
}

// --- Function to post Tweet ---
async function postTweet() {
  try {
    const tweetText = await generateTweetContent();
    console.log("📝 Generated tweet text:", tweetText);
    
    const response = await twitterClient.v2.tweet(tweetText);
    console.log("✅ Tweet posted successfully at", new Date().toLocaleString('en-US', { timeZone: 'Europe/Nicosia' }));
    console.log("📊 Tweet data:", response.data);
  } catch (error) {
    console.error("❌ Error posting tweet:", error);
    if (error.data) {
      console.error("Error details:", error.data);
    }
  }
}

// --- Schedule tweet for Thursdays at 9:15 AM Cyprus time ---
// Cron format: minute hour day month day-of-week
// 15 9 * * 4 = 9:15 AM every Thursday (4 = Thursday, 0 = Sunday)
cron.schedule('15 9 * * 4', () => {
  console.log("⏰ Running scheduled tweet for Thursday 9:15 AM...");
  postTweet();
}, {
  timezone: "Europe/Nicosia"
});

console.log("🤖 Tweet bot is running...");
console.log("📅 Scheduled to post every Thursday at 9:15 AM (Cyprus time)");
console.log("⏰ Current time:", new Date().toLocaleString('en-US', { timeZone: 'Europe/Nicosia' }));
console.log("🔄 Keep this process running to maintain the schedule");
console.log("\n💡 To test immediately, uncomment the line: // postTweet();\n");

// ONLY UNCOMMENT THIS LINE TO TEST IMMEDIATELY:
// postTweet();
import { TwitterApi } from 'twitter-api-v2';
import OpenAI from 'openai';

// --- Setup OpenAI ---
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// --- Setup Twitter ---
const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_SECRET,
});

// --- Function to get AI-generated content ---
async function generateTweetContent() {
  try {
    const prompt = `
    You are a social media content creator. 
    Write a short, engaging tweet about the latest tech trend 
    under 240 characters. Make it conversational and catchy.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 80,
    });

    const aiMessage = response.choices[0]?.message?.content || "";
    return aiMessage.trim();
  } catch (error) {
    console.error("❌ Error generating tweet:", error);
    return "Tech is moving fast! 🚀 What's your take on the latest trends?";
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

// --- Run when GitHub Actions triggers ---
postTweet();

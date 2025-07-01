import OpenAI from "openai";

export async function POST(request: Request) {
  try {
    const { message } = await request.json();

    if (!message) {
      return new Response(
        JSON.stringify({ error: "Message is required" }),
        { status: 400 }
      );
    }

    const openai = new OpenAI();

    const systemPrompt = `You are a compliance classifier for SMS messages. Analyze the provided SMS message and classify it into one or more of these categories:

Categories:
- Political: Messages related to political campaigns, candidates, or political causes
- Fraud: Messages that appear to be scams, phishing attempts, or fraudulent offers
- Illegal: Messages promoting illegal activities or substances
- Adult: Messages with adult/sexual content
- Gambling: Messages promoting betting, gambling, or lottery activities
- Informational: General information, updates, or educational content
- Promotional: Marketing messages, sales promotions, or commercial offers

Instructions:
1. Analyze the message content carefully
2. Return a JSON object with "categories" as an array of applicable categories
3. Include "risk_level" as "low", "medium", or "high"
4. Include "allow_send" as true/false (false for high-risk categories like fraud, illegal)
5. Include "reason" explaining the classification

Example response:
{
  "categories": ["Promotional"],
  "risk_level": "low",
  "allow_send": true,
  "reason": "Standard promotional content for legitimate business offer"
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Classify this SMS message: "${message}"` },
      ],
      max_tokens: 300,
      temperature: 0.1,
    });

    const classificationText = response.choices[0]?.message?.content?.trim();

    if (!classificationText) {
      return new Response(
        JSON.stringify({ error: "Failed to classify SMS content" }),
        { status: 500 }
      );
    }

    let classification;
    try {
      classification = JSON.parse(classificationText);
    } catch (parseError) {
      // If JSON parsing fails, create a basic classification
      classification = {
        categories: ["Informational"],
        risk_level: "medium",
        allow_send: false,
        reason: "Could not properly classify message content",
      };
    }

    return new Response(
      JSON.stringify({
        success: true,
        message,
        classification,
        timestamp: new Date().toISOString(),
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error classifying SMS:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500 }
    );
  }
} 
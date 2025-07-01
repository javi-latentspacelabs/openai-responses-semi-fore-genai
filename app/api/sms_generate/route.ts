import OpenAI from "openai";

export async function POST(request: Request) {
  try {
    const { persona, prompt } = await request.json();

    if (!persona || !prompt) {
      return new Response(
        JSON.stringify({ error: "Persona and prompt are required" }),
        { status: 400 }
      );
    }

    const openai = new OpenAI();

    // PRE-GENERATION COMPLIANCE CHECK
    // Check user's original prompt before generating SMS
    const preCheckResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a content moderator. Analyze the user's prompt and determine if it contains inappropriate content.

          Check for:
          - Adult/escort services
          - Gambling or betting
          - Illegal substances or activities
          - Political campaigns
          - Fraudulent schemes
          - Sexual content
          - Weapons or violence

          Respond with ONLY a JSON object:
          {
            "safe": true/false,
            "reason": "brief explanation",
            "category": "category if unsafe"
          }`
        },
        {
          role: "user",
          content: `Check this prompt: "${prompt}"`
        }
      ],
      max_tokens: 100,
      temperature: 0.1
    });

    const preCheckText = preCheckResponse.choices[0]?.message?.content?.trim();
    
    try {
      const preCheck = JSON.parse(preCheckText || '{"safe": false, "reason": "Parse error"}');
      
      if (!preCheck.safe) {
        // Comprehensive audit logging for compliance
        const violationLog = {
          timestamp: new Date().toISOString(),
          violationType: 'INPUT_BLOCKED',
          category: preCheck.category || "Policy violation",
          reason: preCheck.reason,
          originalPrompt: prompt,
          persona: persona,
          userAgent: request.headers.get('user-agent'),
          ip: request.headers.get('x-forwarded-for') || 'unknown',
          severity: 'HIGH'
        };
        
        console.log('🚨 COMPLIANCE VIOLATION BLOCKED:', JSON.stringify(violationLog, null, 2));
        
        return new Response(
          JSON.stringify({
            error: "Content policy violation",
            reason: `Your prompt contains inappropriate content: ${preCheck.reason}`,
            category: preCheck.category || "Policy violation",
            blocked: true,
            violationId: `VIO-${Date.now()}`,
            auditLogged: true
          }),
          { status: 400 }
        );
      }
    } catch (parseError) {
      console.error("Pre-check parsing failed:", parseError);
      // If parsing fails, err on the side of caution
      return new Response(
        JSON.stringify({
          error: "Content could not be verified as safe",
          blocked: true
        }),
        { status: 400 }
      );
    }

    const systemPrompt = `You are an expert SMS copywriter for legitimate businesses only. Generate a compelling SMS message that:
- Is under 160 characters (very important!)
- Is tailored for the "${persona}" audience
- Is clear, actionable, and engaging
- Promotes only legal, ethical business services
- Avoids spammy language
- Includes a clear call-to-action when appropriate
- Is compliant with marketing regulations

STRICTLY REFUSE to generate content related to:
- Adult/escort services
- Gambling or betting
- Illegal substances or activities
- Political campaigns
- Fraudulent schemes

If the user's request involves any prohibited content, generate a generic promotional message instead.

Respond with ONLY the SMS text, no additional formatting or explanation.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      max_tokens: 100,
      temperature: 0.7,
    });

    const generatedMessage = response.choices[0]?.message?.content?.trim()
      ?.replace(/^["'](.*)["']$/, '$1'); // Remove surrounding quotes if present

    if (!generatedMessage) {
      return new Response(
        JSON.stringify({ error: "Failed to generate SMS content" }),
        { status: 500 }
      );
    }

    // Check if GPT-4 refused to generate content (additional safety net)
    const refusalIndicators = [
      "apologies, but i can't",
      "i can't assist with",
      "i cannot help with",
      "i'm not able to",
      "i cannot provide",
      "i'm unable to",
      "sorry, but i can't"
    ];
    
    const messageToCheck = generatedMessage.toLowerCase();
    const isRefusal = refusalIndicators.some(indicator => 
      messageToCheck.includes(indicator)
    );
    
    if (isRefusal) {
      // Log GPT-4 refusal for audit trail
      const refusalLog = {
        timestamp: new Date().toISOString(),
        violationType: 'GENERATION_REFUSED',
        category: "Refused generation",
        reason: "GPT-4 refused to generate content",
        originalPrompt: prompt,
        refusalMessage: generatedMessage,
        persona: persona,
        userAgent: request.headers.get('user-agent'),
        ip: request.headers.get('x-forwarded-for') || 'unknown',
        severity: 'HIGH'
      };
      
      console.log('🚨 GPT-4 CONTENT REFUSAL LOGGED:', JSON.stringify(refusalLog, null, 2));
      
      return new Response(
        JSON.stringify({
          error: "Content policy violation",
          reason: "The system cannot generate content for this type of request",
          category: "Refused generation",
          blocked: true,
          violationId: `REF-${Date.now()}`,
          auditLogged: true
        }),
        { status: 400 }
      );
    }

    // Check message length
    if (generatedMessage.length > 160) {
      return new Response(
        JSON.stringify({
          error: "Generated message exceeds 160 characters",
          message: generatedMessage,
          length: generatedMessage.length,
        }),
        { status: 400 }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: generatedMessage,
        persona,
        length: generatedMessage.length,
        charactersRemaining: 160 - generatedMessage.length,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error generating SMS:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500 }
    );
  }
} 
// List of tools available to the assistant
// No need to include the top-level wrapper object as it is added in lib/tools/tools.ts
// More information on function calling: https://platform.openai.com/docs/guides/function-calling

export const toolsList = [
  {
    name: "get_weather",
    description: "Get the weather for a given location",
    parameters: {
      location: {
        type: "string",
        description: "Location to get weather for",
      },
      unit: {
        type: "string",
        description: "Unit to get weather in",
        enum: ["celsius", "fahrenheit"],
      },
    },
  },
  {
    name: "get_joke",
    description: "Get a programming joke",
    parameters: {},
  },
  {
    name: "sms_generate",
    description: "Generate a short SMS message under 160 characters for a specific persona and purpose",
    parameters: {
      persona: {
        type: "string",
        description: "The target persona or audience (e.g., 'students', 'professionals', 'parents')",
      },
      prompt: {
        type: "string",
        description: "The message content or campaign goal to generate SMS for",
      },
    },
  },
  {
    name: "sms_classify",
    description: "Classify SMS content into compliance categories to ensure regulatory compliance",
    parameters: {
      message: {
        type: "string",
        description: "The SMS message text to classify",
      },
    },
  },
  {
    name: "sms_send",
    description: "Send SMS message via Semaphore API to specified recipients",
    parameters: {
      message: {
        type: "string",
        description: "The SMS message content to send",
      },
      recipients: {
        type: "array",
        items: {
          type: "string",
        },
        description: "Array of phone numbers to send the SMS to (format: +63917xxxxxxx)",
      },
    },
  },
];

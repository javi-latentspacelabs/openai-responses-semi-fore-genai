# Responses starter app

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
![NextJS](https://img.shields.io/badge/Built_with-NextJS-blue)
![OpenAI API](https://img.shields.io/badge/Powered_by-OpenAI_API-orange)

This repository contains a NextJS starter app built on top of the [Responses API](https://platform.openai.com/docs/api-reference/responses).
It leverages built-in tools ([web search](https://platform.openai.com/docs/guides/tools-web-search?api-mode=responses) and [file search](https://platform.openai.com/docs/guides/tools-file-search)) and implements a chat interface with multi-turn conversation handling.

**This version has been extended to include SMS Campaign Generation capabilities:**

## 🚀 SMS Campaign Features

- **SMS Generation**: Create personalized SMS messages for different personas (students, professionals, parents, etc.)
- **Compliance Classification**: Automatically classify messages into categories (Political, Fraud, Illegal, Adult, Gambling, Informational, Promotional)
- **Automated Sending**: Send compliant messages via Semaphore API
- **Real-time Feedback**: See classification results and delivery status in the chat interface
- **Audit Logging**: Track all generated content and delivery outcomes

## 📱 SMS Tools Available

1. **sms_generate** - Generate persona-specific SMS content under 160 characters
2. **sms_classify** - Classify SMS content for regulatory compliance
3. **sms_send** - Send SMS messages via Semaphore API to specified recipients

## 🔧 Original Features

- Multi-turn conversation handling
- Web search tool configuration
- Vector store creation & file upload for use with the file search tool
- Function calling
- Streaming responses & tool calls
- Display annotations

This app is meant to be used as a starting point to build a conversational assistant that you can customize to your needs.

## How to use

1. **Set up the OpenAI API:**

   - If you're new to the OpenAI API, [sign up for an account](https://platform.openai.com/signup).
   - Follow the [Quickstart](https://platform.openai.com/docs/quickstart) to retrieve your API key.

2. **Set up API keys:**

   Create a `.env` file at the root of the project and add the following:

   ```bash
   # Required: OpenAI API key
   OPENAI_API_KEY=your_openai_api_key_here
   
   # Required for SMS functionality: Semaphore API key
   # Get your API key from: https://semaphore.co/
   SEMAPHORE_API_KEY=your_semaphore_api_key_here
   ```

   Alternative: Set environment variables globally in your system.

3. **Clone the Repository:**

   ```bash
   git clone https://github.com/openai/openai-responses-starter-app.git
   ```

4. **Install dependencies:**

   Run in the project root:

   ```bash
   npm install
   ```

5. **Run the app:**

   ```bash
   npm run dev
   ```

   The app will be available at [`http://localhost:3000`](http://localhost:3000).

## 📱 SMS Campaign Usage Examples

Once the app is running, you can try these example prompts:

**Generate SMS for different personas:**
- "Generate an SMS promoting our sale to students"
- "Create a promotional message for working professionals about our new app"
- "Write an SMS for parents about our educational workshop"

**The assistant will automatically:**
1. Generate appropriate SMS content (under 160 characters)
2. Classify the message for compliance
3. Show you the classification results
4. Offer to send the message if it's compliant

**Example conversation flow:**
```
User: Generate an SMS promoting our 20% discount to students

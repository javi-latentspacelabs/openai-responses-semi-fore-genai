# SMS Campaign Builder - Testing Guide

## 🧪 Test Mode

The SMS Campaign Builder automatically runs in **test mode** during development, so you can test the entire SMS flow without sending real messages or needing valid Philippine phone numbers.

### How Test Mode Works

When `NODE_ENV=development` (default with `npm run dev`):
- ✅ **No real SMS messages are sent**
- ✅ **Mock responses simulate real API calls**
- ✅ **All features work exactly as in production**
- ✅ **Test with any phone number format**

### Test Phone Numbers

Try these special test numbers to simulate different scenarios:

| Phone Number | Result |
|-------------|--------|
| `+639123456789` | ✅ Success - Message sent |
| `+639987654321` | ✅ Success - Message sent |
| `+639111222333` | ✅ Success - Message sent |
| `+639failtest` | ❌ Simulates API failure |
| `+639invalidtest` | ❌ Simulates invalid number |

### Testing the Complete Flow

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Visit** `http://localhost:3000`

3. **Look for the yellow test banner** at the top

4. **Follow the 4-step campaign creation**:
   - Step 1: Choose audience (e.g. Students)
   - Step 2: Select campaign type (e.g. Sale/Discount)
   - Step 3: Describe your campaign (e.g. "20% off Doritos for 20 days")
   - Step 4: Review generated SMS and test send

5. **Use any test number** from the quick-click buttons

6. **Check the console logs** to see what would happen:
   ```
   🧪 SMS TEST MODE - Message would be sent:
   📱 To: +639123456789
   💬 Message: 🎉 Hey students! Get 20% off Doritos...
   📊 Length: 156/160 characters
   ```

## 🔑 Environment Setup

### Required for Testing (Development)
```bash
# Only needed for AI generation/classification
OPENAI_API_KEY=your_openai_key_here
```

### Required for Production
```bash
# Both keys needed for real SMS sending
OPENAI_API_KEY=your_openai_key_here
SEMAPHORE_API_KEY=your_semaphore_key_here

# Optional: Force test mode even in production
SMS_TEST_MODE=true
```

## 🚀 Production vs Test Mode

| Feature | Test Mode | Production Mode |
|---------|-----------|-----------------|
| SMS Generation | ✅ Real OpenAI API | ✅ Real OpenAI API |
| Compliance Check | ✅ Real OpenAI API | ✅ Real OpenAI API |
| SMS Sending | 🧪 Simulated | 📱 Real Semaphore API |
| Phone Validation | 🔄 Accepts any format | 🇵🇭 Philippine numbers only |
| API Costs | 💰 Only OpenAI (generation) | 💰 OpenAI + Semaphore (sending) |

## 🛠 Advanced Testing

### Force Test Mode in Production
Set environment variable:
```bash
SMS_TEST_MODE=true
```

### Test API Endpoints Directly

**Generate SMS:**
```bash
curl -X POST http://localhost:3000/api/sms_generate \
  -H "Content-Type: application/json" \
  -d '{"persona":"students","prompt":"20% discount on snacks"}'
```

**Classify SMS:**
```bash
curl -X POST http://localhost:3000/api/sms_classify \
  -H "Content-Type: application/json" \
  -d '{"message":"Get 20% off snacks today!"}'
```

**Test Send SMS:**
```bash
curl -X POST http://localhost:3000/api/sms_send \
  -H "Content-Type: application/json" \
  -d '{"message":"Test message","recipient":"+639123456789"}'
```

## 🌟 Ready for Production?

1. **Get your Semaphore API key** from [semaphore.co](https://semaphore.co)
2. **Add Philippine recipients** (format: +639XXXXXXXXX)
3. **Set environment variables** for production
4. **Deploy and test** with small batches first

Happy testing! 🎉 
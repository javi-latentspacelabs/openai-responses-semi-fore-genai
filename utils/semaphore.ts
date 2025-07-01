// Semaphore API integration utilities
// Documentation: https://semaphore.co/docs

// Semaphore SMS API utilities
const SEMAPHORE_API_BASE = 'https://api.semaphore.co/api/v4';

// Check if we're in test mode
const IS_TEST_MODE = process.env.NODE_ENV === 'development' || process.env.SMS_TEST_MODE === 'true';

export interface SemaphoreResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export interface SMSMessage {
  message_id: number;
  user_id: number;
  user: string;
  account_id: number;
  account: string;
  recipient: string;
  message: string;
  sender_name: string;
  network: string;
  status: string;
  type: string;
  source: string;
  created_at: string;
  updated_at: string;
}

// Mock responses for testing
const createMockResponse = (recipient: string, message: string): SMSMessage => ({
  message_id: Math.floor(Math.random() * 1000000),
  user_id: 12345,
  user: "test@example.com",
  account_id: 67890,
  account: "Test Account",
  recipient: recipient,
  message: message,
  sender_name: "SEMAPHORE",
  network: recipient.startsWith('+639') ? "Globe" : "International",
  status: "Queued",
  type: "Single",
  source: "Api",
  created_at: new Date().toISOString().replace('T', ' ').slice(0, 19),
  updated_at: new Date().toISOString().replace('T', ' ').slice(0, 19)
});

export async function sendSMS(recipient: string, message: string): Promise<SemaphoreResponse> {
  // Test mode - simulate successful sending
  if (IS_TEST_MODE) {
    console.log('🧪 SMS TEST MODE - Message would be sent:');
    console.log(`📱 To: ${recipient}`);
    console.log(`💬 Message: ${message}`);
    console.log(`📊 Length: ${message.length}/160 characters`);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulate different scenarios based on recipient
    if (recipient.includes('fail')) {
      return {
        success: false,
        error: 'Test failure simulation'
      };
    }
    
    if (recipient.includes('invalid')) {
      return {
        success: false,
        error: 'Invalid phone number format'
      };
    }
    
    return {
      success: true,
      data: [createMockResponse(recipient, message)]
    };
  }

  // Production mode - actual Semaphore API call
  const apiKey = process.env.SEMAPHORE_API_KEY;
  
  if (!apiKey) {
    return {
      success: false,
      error: 'SEMAPHORE_API_KEY not configured'
    };
  }

  try {
    const response = await fetch(`${SEMAPHORE_API_BASE}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        apikey: apiKey,
        number: recipient,
        message: message,
        sendername: 'SEMAPHORE'
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || 'Failed to send SMS'
      };
    }

    return {
      success: true,
      data: data
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error'
    };
  }
}

export function validatePhilippineNumber(number: string): boolean {
  // Philippine mobile number formats:
  // +639XXXXXXXXX (international format)
  // 639XXXXXXXXX (without +)
  // 09XXXXXXXXX (local format)
  // 9XXXXXXXXX (without leading 0)
  
  const philippineRegex = /^(\+63|63|0)?9\d{9}$/;
  return philippineRegex.test(number.replace(/\s+/g, ''));
}

export function formatPhilippineNumber(number: string): string {
  // Remove all non-digits
  const cleaned = number.replace(/\D/g, '');
  
  // Convert to +639XXXXXXXXX format
  if (cleaned.startsWith('639')) {
    return '+' + cleaned;
  } else if (cleaned.startsWith('09')) {
    return '+63' + cleaned.substring(1);
  } else if (cleaned.startsWith('9') && cleaned.length === 10) {
    return '+63' + cleaned;
  }
  
  return number; // Return as-is if format is unclear
} 
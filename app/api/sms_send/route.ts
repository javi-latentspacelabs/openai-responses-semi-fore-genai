import { NextRequest, NextResponse } from 'next/server';
import { sendSMS, validatePhilippineNumber, formatPhilippineNumber } from '@/utils/semaphore';

export async function POST(request: NextRequest) {
  try {
    const { message, recipient } = await request.json();

    if (!message || !recipient) {
      return NextResponse.json(
        { success: false, error: 'Message and recipient are required' },
        { status: 400 }
      );
    }

    // Validate message length
    if (message.length > 160) {
      return NextResponse.json(
        { success: false, error: 'Message exceeds 160 character limit' },
        { status: 400 }
      );
    }

    // Format and validate Philippine number
    const formattedNumber = formatPhilippineNumber(recipient);
    
    if (!validatePhilippineNumber(formattedNumber)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid Philippine mobile number. Use format: +639XXXXXXXXX or 09XXXXXXXXX' 
        },
        { status: 400 }
      );
    }

    // Send SMS using our utility function
    const result = await sendSMS(formattedNumber, message);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'SMS sent successfully',
        data: result.data
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('SMS Send Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
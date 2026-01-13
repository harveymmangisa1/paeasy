import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Generate verification token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Store verification token in database (you'll need to create this table)
    const { error } = await supabase!
      .from('email_verifications')
      .insert({
        email,
        token,
        expires_at: expiresAt.toISOString(),
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error storing verification token:', error);
      return NextResponse.json({ error: 'Failed to create verification token' }, { status: 500 });
    }

    // TODO: Send actual email with verification link
    // For now, we'll log the token (in production, use email service)
    const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}&email=${encodeURIComponent(email)}`;
    
    console.log('=== EMAIL VERIFICATION LINK ===');
    console.log('Email:', email);
    console.log('Link:', verificationLink);
    console.log('Token:', token);
    console.log('=== END EMAIL VERIFICATION ===');

    // Simulate email sending
    await sendVerificationEmail(email, verificationLink, token);

    return NextResponse.json({ 
      message: 'Verification email sent successfully',
      // For development only - remove in production
      debugInfo: {
        token,
        verificationLink
      }
    });

  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function sendVerificationEmail(email: string, verificationLink: string, token: string) {
  // In production, integrate with email service like:
  // - SendGrid
  // - AWS SES  
  // - Mailgun
  // - Resend
  
  const emailContent = `
    <html>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #f8f9fa; padding: 30px; border-radius: 10px;">
          <h1 style="color: #1e40af; text-align: center; margin-bottom: 30px;">
            PaeasyShop - Verify Your Email
          </h1>
          
          <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            Thank you for signing up for PaeasyShop! To complete your registration and access your shop dashboard, please verify your email address by clicking the button below.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationLink}" 
               style="background: #1e40af; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              Verify Email Address
            </a>
          </div>
          
          <p style="font-size: 14px; color: #666; margin-bottom: 20px;">
            Or copy and paste this link into your browser:
          </p>
          
          <div style="background: #e9ecef; padding: 15px; border-radius: 5px; word-break: break-all; margin-bottom: 20px;">
            ${verificationLink}
          </div>
          
          <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
            <p style="margin: 0; color: #856404; font-size: 14px;">
              <strong>For Development:</strong> Token: <code style="background: #f8f9fa; padding: 2px 4px; border-radius: 3px;">${token}</code>
            </p>
          </div>
          
          <p style="font-size: 12px; color: #999; margin-top: 30px;">
            This link will expire in 24 hours. If you didn't create an account with us, please ignore this email.
          </p>
          
          <hr style="border: none; border-top: 1px solid #dee2e6; margin: 30px 0;">
          
          <p style="font-size: 12px; color: #666; text-align: center;">
            © 2025 PaeasyShop. All rights reserved.
          </p>
        </div>
      </body>
    </html>
  `;

  try {
    // TODO: Replace with actual email service
    // Example with a hypothetical email service:
    /*
    const response = await fetch('https://api.emailservice.com/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.EMAIL_SERVICE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to: email,
        subject: 'Verify your PaeasyShop account',
        html: emailContent
      })
    });
    */

    // For now, just log that we would send the email
    console.log('Email would be sent to:', email);
    console.log('Email content length:', emailContent.length);
    
    return { success: true };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { success: false, error };
  }
}
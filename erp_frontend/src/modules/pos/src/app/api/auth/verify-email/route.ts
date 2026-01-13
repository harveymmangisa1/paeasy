import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import crypto from 'crypto';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    if (!token || !email) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/verify-email?error=missing_params`);
    }

    // Check if token exists and is not expired
    const { data: verification, error } = await supabase!
      .from('email_verifications')
      .select('*')
      .eq('token', token)
      .eq('email', email)
      .single();

    if (error || !verification) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/verify-email?error=invalid_token`);
    }

    // Check if token is expired
    if (new Date(verification.expires_at) < new Date()) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/verify-email?error=expired_token`);
    }

    // Check if already used
    if (verification.used_at) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/verify-email?error=already_used`);
    }

    // Mark token as used
    await supabase!
      .from('email_verifications')
      .update({ 
        used_at: new Date().toISOString() 
      })
      .eq('id', verification.id);

    // Note: In production, you might want to update Supabase Auth user metadata
    // For now, we'll focus on the local staff record update

    // If there's a staff record, update it
    if (verification.id) {
      await supabase!
        .from('staff')
        .update({ 
          email_verified: true,
          email_verified_at: new Date().toISOString()
        })
        .eq('email', email);
    }

    // Success - redirect with success message
    const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?success=true&email=${encodeURIComponent(email)}`;
    return NextResponse.redirect(redirectUrl);

  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/verify-email?error=server_error`);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Generate new verification token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Delete any existing unused tokens for this email
    await supabase!
      .from('email_verifications')
      .delete()
      .eq('email', email)
      .is('used_at', null);

    // Store new verification token
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

    // Generate verification link
    const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/verify-email?token=${token}&email=${encodeURIComponent(email)}`;
    
    // For development - return token in response
    return NextResponse.json({ 
      message: 'Verification email sent successfully',
      verificationLink,
      // Remove in production - only for development
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
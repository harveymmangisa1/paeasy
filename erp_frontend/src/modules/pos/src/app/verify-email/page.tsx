'use client';

import { useEffect, useState, Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Mail,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Loader2,
    ArrowRight,
    RefreshCcw,
    Store
} from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

// Wrap in a separate component to handle useSearchParams in a Suspense boundary
function VerifyEmailContent() {
    const searchParams = useSearchParams();
    const [status, setStatus] = useState<'loading' | 'pending' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');
    const [email, setEmail] = useState('');

    useEffect(() => {
        const success = searchParams.get('success');
        const error = searchParams.get('error');
        const emailParam = searchParams.get('email');

        if (emailParam) setEmail(emailParam);

        // Simulate a slight delay for a smoother "Verification" feel
        const timer = setTimeout(() => {
            if (success === 'true') {
                setStatus('success');
                setMessage(`Your account is now active. We've verified ${emailParam || 'your email address'}.`);
            } else if (error) {
                setStatus('error');
                const errorMessages: Record<string, string> = {
                    'missing_params': 'The verification link is incomplete or broken.',
                    'invalid_token': 'This verification link is invalid. It may have been tampered with.',
                    'expired_token': 'This verification link has expired for security reasons.',
                    'already_used': 'This email has already been verified. You can proceed to login.',
                    'server_error': 'Our authentication server is currently busy. Please try again.'
                };
                setMessage(errorMessages[error] || 'Verification failed. Please try again or contact support.');
            } else {
                // Initial state after signup - show "Please check your email"
                setStatus('pending');
                setMessage('We have sent a verification link to your email address. Please check your inbox (and spam folder) to activate your shop.');
            }
        }, 800);

        return () => clearTimeout(timer);
    }, [searchParams]);

    return (
        <Card className="w-full max-w-md shadow-2xl border-slate-200/60 overflow-hidden bg-white/80 backdrop-blur-sm">
            {/* TOP COLOR BAR */}
            <div className={`h-1.5 w-full ${status === 'success' ? 'bg-emerald-500' :
                status === 'error' ? 'bg-red-500' :
                    status === 'pending' ? 'bg-blue-500' : 'bg-blue-600 animate-pulse'
                }`} />

            <CardContent className="pt-10 pb-8 px-8 text-center">
                {/* ICON DYNAMICS */}
                <div className="flex justify-center mb-6">
                    <div className={`relative h-20 w-20 rounded-full flex items-center justify-center transition-all duration-500 ${status === 'success' ? 'bg-emerald-50 border-emerald-100' :
                        status === 'error' ? 'bg-red-50 border-red-100' : 'bg-blue-50 border-blue-100'
                        } border-4`}>
                        {status === 'loading' && <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />}
                        {status === 'pending' && <Mail className="h-10 w-10 text-blue-600 animate-bounce" />}
                        {status === 'success' && <CheckCircle2 className="h-10 w-10 text-emerald-600 animate-in zoom-in duration-300" />}
                        {status === 'error' && <XCircle className="h-10 w-10 text-red-600 animate-in shake duration-300" />}
                    </div>
                </div>

                {/* TEXT CONTENT */}
                <div className="space-y-2 mb-8">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                        {status === 'loading' && "Connecting..."}
                        {status === 'pending' && "Check your inbox"}
                        {status === 'success' && "Email Verified!"}
                        {status === 'error' && "Verification Failed"}
                    </h2>
                    <p className="text-slate-500 text-sm leading-relaxed px-4">
                        {message}
                    </p>
                </div>

                {/* ACTION BUTTONS */}
                <div className="space-y-3">
                    {status === 'success' && (
                        <Button asChild className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-100 transition-all active:scale-95">
                            <Link href="/login">
                                Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    )}

                    {status === 'error' && (
                        <>
                            <Button asChild className="w-full h-12 bg-slate-900 hover:bg-black text-white font-bold transition-all">
                                <Link href="/login">
                                    Return to Login
                                </Link>
                            </Button>
                            <Button variant="ghost" className="w-full text-slate-500 text-xs hover:bg-slate-50 font-bold uppercase tracking-widest">
                                <RefreshCcw className="mr-2 h-3 w-3" /> Resend Verification Link
                            </Button>
                        </>
                    )}

                    {status === 'loading' && (
                        <div className="flex items-center justify-center gap-2 text-slate-400 text-sm font-medium italic">
                            Connecting to Octet Secure Auth...
                        </div>
                    )}

                    {status === 'pending' && (
                        <div className="space-y-4">
                            <p className="text-xs text-slate-400 italic">
                                Didn't receive the email? Check your spam folder or wait a few minutes.
                            </p>
                            <Button variant="outline" className="w-full flex items-center justify-center gap-2" onClick={() => window.location.reload()}>
                                <RefreshCcw className="h-4 w-4" /> I've clicked the link
                            </Button>
                        </div>
                    )}
                </div>
            </CardContent>

            {/* HELPFUL FOOTER FOR ERRORS */}
            {status === 'error' && (
                <div className="bg-slate-50 border-t border-slate-100 p-4">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-amber-500 shrink-0" />
                        <div className="text-left text-[11px] text-slate-500 leading-normal">
                            <p className="font-bold text-slate-700 mb-0.5 uppercase tracking-tighter">Pro Tip</p>
                            Verify if you are using the most recent email sent to you. Links expire after 24 hours.
                        </div>
                    </div>
                </div>
            )}
        </Card>
    );
}

// Main Page Component
export default function VerifyEmailPage() {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            {/* BRANDING HEADER */}
            <div className="mb-8 flex items-center gap-2">
                <div className="bg-blue-600 p-1.5 rounded-lg shadow-md shadow-blue-100">
                    <Store className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-black tracking-tighter text-slate-900">PAEASY<span className="text-blue-600">SHOP</span></span>
            </div>

            <Suspense fallback={
                <Card className="w-full max-w-md shadow-xl border-slate-100 p-12 flex justify-center">
                    <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                </Card>
            }>
                <VerifyEmailContent />
            </Suspense>

            <p className="mt-8 text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">
                Secure POS Ecosystem by Octet Systems Malawi
            </p>
        </div>
    );
}
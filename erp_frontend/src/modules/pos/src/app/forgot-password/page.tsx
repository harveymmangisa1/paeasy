'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Store, Mail, ChevronLeft, Loader2, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
    const { resetPassword } = useAuth();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            setError('Please enter your email address');
            return;
        }

        setLoading(true);
        setError('');

        const { success, error: resetError } = await resetPassword(email);

        if (success) {
            setSubmitted(true);
        } else {
            setError(resetError || 'Failed to send reset link. Please try again.');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50/50">
            <div className="w-full max-w-[400px] space-y-8">
                <div className="text-center space-y-2">
                    <div className="flex justify-center mb-6">
                        <div className="bg-blue-600 p-2 rounded-lg">
                            <Store className="h-6 w-6 text-white" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Reset password</h1>
                    <p className="text-slate-500 text-sm font-medium">
                        We'll send you a link to reset your account
                    </p>
                </div>

                <Card className="border-slate-200/60 shadow-xl shadow-slate-200/50">
                    <CardHeader className="pb-4">
                        {submitted ? (
                            <div className="py-6 text-center space-y-4">
                                <div className="flex justify-center">
                                    <CheckCircle2 className="h-12 w-12 text-emerald-500" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-lg font-bold text-slate-900">Check your email</h3>
                                    <p className="text-sm text-slate-500">
                                        We've sent a password reset link to <span className="font-semibold text-slate-900">{email}</span>.
                                    </p>
                                </div>
                                <div className="pt-4">
                                    <Link href="/login">
                                        <Button variant="outline" className="w-full">
                                            Back to login
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-xs font-bold uppercase text-slate-500">Email Address</Label>
                                    <div className="relative group">
                                        <Mail className="absolute left-3 top-3.5 h-4 w-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                                        <Input
                                            id="email"
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="name@business.com"
                                            className="pl-10 h-11 border-slate-200 focus:ring-blue-600"
                                            required
                                        />
                                    </div>
                                </div>

                                {error && (
                                    <Alert variant="destructive" className="bg-red-50 border-red-100 py-3">
                                        <AlertDescription className="text-xs font-medium">{error}</AlertDescription>
                                    </Alert>
                                )}

                                <Button
                                    type="submit"
                                    className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all"
                                    disabled={loading}
                                >
                                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                    {loading ? 'Sending link...' : 'Send Reset Link'}
                                </Button>

                                <div className="text-center pt-2">
                                    <Link href="/login" className="flex items-center justify-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
                                        <ChevronLeft className="h-4 w-4" />
                                        Back to login
                                    </Link>
                                </div>
                            </form>
                        )}
                    </CardHeader>
                </Card>

                <div className="pt-8 text-center border-t border-slate-200">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                        Powered by Octet Systems Malawi
                    </p>
                </div>
            </div>
        </div>
    );
}

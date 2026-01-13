'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Store, Lock, Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react';

export default function ResetPasswordPage() {
    const router = useRouter();
    const { updatePassword } = useAuth();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        setError('');

        const { success, error: updateError } = await updatePassword(password);

        if (success) {
            setSuccess(true);
            setTimeout(() => {
                router.push('/login');
            }, 3000);
        } else {
            setError(updateError || 'Failed to update password. Please try again.');
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
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Set new password</h1>
                    <p className="text-slate-500 text-sm font-medium">
                        Please enter your new password below
                    </p>
                </div>

                <Card className="border-slate-200/60 shadow-xl shadow-slate-200/50">
                    <CardHeader className="pb-4">
                        {success ? (
                            <div className="py-6 text-center space-y-4">
                                <div className="flex justify-center">
                                    <CheckCircle2 className="h-12 w-12 text-emerald-500" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-lg font-bold text-slate-900">Password updated!</h3>
                                    <p className="text-sm text-slate-500">
                                        Your password has been successfully changed. Redirecting you to login...
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                                <div className="space-y-2">
                                    <Label htmlFor="password" className="text-xs font-bold uppercase text-slate-500">New Password</Label>
                                    <div className="relative group">
                                        <Lock className="absolute left-3 top-3.5 h-4 w-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                                        <Input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="pl-10 h-11 border-slate-200 focus:ring-blue-600"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                                        >
                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword" className="text-xs font-bold uppercase text-slate-500">Confirm Password</Label>
                                    <div className="relative group">
                                        <Lock className="absolute left-3 top-3.5 h-4 w-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                                        <Input
                                            id="confirmPassword"
                                            type={showPassword ? "text" : "password"}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="••••••••"
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
                                    {loading ? 'Updating password...' : 'Update Password'}
                                </Button>
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
